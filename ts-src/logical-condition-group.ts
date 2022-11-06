import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {Fragment, isFragment, LogicalOperator} from '@franzzemen/re-common';
import {Condition, ConditionI, ConditionReference} from '@franzzemen/re-condition';
import {isPromise} from 'node:util/types';
import {LogicalConditionGroupReference} from './logical-condition-group-reference.js';
import {LogicalConditionResult} from './logical-condition-result.js';
import {LogicalConditionScope} from './scope/logical-condition-scope.js';

export type LogicalConditionOrLogicalConditionGroup = LogicalCondition | LogicalConditionGroup;

export function isLogicalCondition(group: LogicalCondition | LogicalConditionGroup): group is LogicalCondition {
  return 'operator' in group && 'condition' in group;
}

export function isLogicalConditionGroup(group: LogicalCondition | LogicalConditionGroup): group is LogicalConditionGroup {
  return 'operator' in group && 'conditions' in group;
}

export class LogicalCondition {
  operator: LogicalOperator;
  condition: ConditionI;

  constructor(fragment: Fragment<LogicalOperator, ConditionReference>, scope: LogicalConditionScope, ec?: LogExecutionContext) {
    this.operator = fragment.operator;
    this.condition = new Condition(fragment.reference, scope, ec);
  }
}

export class LogicalConditionGroup {
  operator: LogicalOperator;
  conditions: LogicalConditionOrLogicalConditionGroup[] = [];

  constructor(ref: LogicalConditionGroupReference, scope: LogicalConditionScope, ec?: LogExecutionContext) {
    this.operator = ref.operator;
    ref.group.forEach(element => {
      if (isFragment(element)) {
        const logicalCondition = new LogicalCondition(element, scope, ec);
        this.conditions.push(logicalCondition);
      } else {
        const childInstance = new LogicalConditionGroup(element, scope, ec);
        this.conditions.push(childInstance);
      }
    });
    if (!scope.isResolved()) {
      const log = new LoggerAdapter(ec, 're-logical-condition', 'logical-condition-group', 'constructor');
      log.debug({scope}, 'Scope needs to be externally resolved');
    }
  }

  static reduce(parentOperator: LogicalOperator, logicalResults: LogicalConditionResult[]): LogicalConditionResult {
    const innerResult = LogicalConditionGroup.reduceOrs(LogicalConditionGroup.reduceAnds(logicalResults));
    switch (parentOperator) {
      case LogicalOperator.and:
        switch (innerResult.logicalOperator) {
          case LogicalOperator.and:
          case LogicalOperator.andNot:
          case LogicalOperator.or:
          case LogicalOperator.orNot:
          default:
            break;
        }
        break;
      case LogicalOperator.andNot:
        switch (innerResult.logicalOperator) {
          case LogicalOperator.and:
            innerResult.logicalOperator = LogicalOperator.andNot;
            break;
          case LogicalOperator.andNot:
            innerResult.logicalOperator = LogicalOperator.and;
            break;
          case LogicalOperator.or:
            innerResult.logicalOperator = LogicalOperator.orNot;
            break;
          case LogicalOperator.orNot:
            innerResult.logicalOperator = LogicalOperator.or;
            break;
          default:
            break;
        }
        break;
      case LogicalOperator.or:
        switch (innerResult.logicalOperator) {
          case LogicalOperator.and:
            innerResult.logicalOperator = LogicalOperator.or;
            break;
          case LogicalOperator.andNot:
            innerResult.logicalOperator = LogicalOperator.orNot;
            break;
          case LogicalOperator.or:
            innerResult.logicalOperator = LogicalOperator.or;
            break;
          case LogicalOperator.orNot:
            innerResult.logicalOperator = LogicalOperator.orNot;
            break;
          default:
            break;
        }
        break;
      case LogicalOperator.orNot:
        switch (innerResult.logicalOperator) {
          case LogicalOperator.and:
            innerResult.logicalOperator = LogicalOperator.orNot;
            break;
          case LogicalOperator.andNot:
            innerResult.logicalOperator = LogicalOperator.or;
            break;
          case LogicalOperator.or:
            innerResult.logicalOperator = LogicalOperator.orNot;
            break;
          case LogicalOperator.orNot:
            innerResult.logicalOperator = LogicalOperator.or;
            break;
          default:
            break;
        }
        break;
    }
    return innerResult;
  }

  static reduceAnds(logicalResults: LogicalConditionResult[]): LogicalConditionResult[] {
    for (let i = logicalResults.length - 1; i > 0; i--) {
      let currResult = logicalResults[i];
      let priorResult = logicalResults[i - 1];
      let result: LogicalConditionResult;
      if (currResult.logicalOperator === LogicalOperator.and) {
        if (priorResult.logicalOperator === LogicalOperator.and) {
          // Both ands
          result = {logicalOperator: LogicalOperator.and, result: currResult.result && priorResult.result};
        } else if (priorResult.logicalOperator === LogicalOperator.andNot) {
          // Evaluate the prior "not" and use the and comparator for the combination
          result = {logicalOperator: LogicalOperator.and, result: currResult.result && !priorResult.result};
        } else if (priorResult.logicalOperator === LogicalOperator.or) {
          // Keep the or, and combine with and
          result = {logicalOperator: LogicalOperator.or, result: currResult.result && priorResult.result};
        } else {
          // Change to or, and handle the ! in the combination
          result = {logicalOperator: LogicalOperator.or, result: currResult.result && priorResult.result};
        }
      } else { // andNot
        if (priorResult.logicalOperator === LogicalOperator.and) {
          // Keep the and and take care of the not in the combination
          result = {logicalOperator: LogicalOperator.and, result: !currResult.result && priorResult.result};
        } else if (priorResult.logicalOperator === LogicalOperator.andNot) {
          // Change to and and handle both ! in the combination
          result = {logicalOperator: LogicalOperator.and, result: !currResult.result && !priorResult.result};
        } else if (priorResult.logicalOperator === LogicalOperator.or) {
          // Keep the or, and combine with ! and
          result = {logicalOperator: LogicalOperator.or, result: !currResult.result && priorResult.result};
        } else { // not Or
          // Change to or, and handle the ! in the combination
          result = {logicalOperator: LogicalOperator.or, result: !currResult.result && !priorResult.result};
        }
      }
      if (currResult.logicalOperator === LogicalOperator.and || currResult.logicalOperator === LogicalOperator.andNot) {
        logicalResults[i - 1] = result;
        logicalResults.splice(i, 1);
      }
    }
    return logicalResults;
  }

  static reduceOrs(logicalResults: LogicalConditionResult[]): LogicalConditionResult {
    for (let i = logicalResults.length - 1; i > 0; i--) {
      let currentResult = logicalResults[i];
      let priorResult = logicalResults[i - 1];
      let result: LogicalConditionResult;
      if (currentResult.logicalOperator === LogicalOperator.or) {
        if (priorResult.logicalOperator === LogicalOperator.or) {
          result = {logicalOperator: LogicalOperator.or, result: currentResult.result || priorResult.result};
        } else if (priorResult.logicalOperator === LogicalOperator.orNot) {
          result = {logicalOperator: LogicalOperator.or, result: currentResult.result || !priorResult.result};
        } else if (priorResult.logicalOperator === LogicalOperator.and && i === 1) {
          result = {logicalOperator: LogicalOperator.and, result: currentResult.result || priorResult.result};
        } else if (priorResult.logicalOperator === LogicalOperator.andNot && i === 1) {
          result = {logicalOperator: LogicalOperator.and, result: currentResult.result || !priorResult.result};
        } else {
          throw new Error('Reduce Ors, unexpected condition 1 (and encountered at wrong spot)');
        }
      } else if (currentResult.logicalOperator === LogicalOperator.orNot) {
        if (priorResult.logicalOperator === LogicalOperator.or) {
          result = {logicalOperator: LogicalOperator.or, result: !currentResult.result || priorResult.result};
        } else if (priorResult.logicalOperator === LogicalOperator.orNot) {
          result = {logicalOperator: LogicalOperator.or, result: !currentResult.result || !priorResult.result};
        } else if (priorResult.logicalOperator === LogicalOperator.and && i === 1) {
          result = {logicalOperator: LogicalOperator.and, result: !currentResult.result || priorResult.result};
        } else if (priorResult.logicalOperator === LogicalOperator.andNot && i === 1) {
          result = {logicalOperator: LogicalOperator.and, result: !currentResult.result || !priorResult.result};
        }
      } else {
        throw new Error('Reduce Ors, unexpected comparator beyond first entry');
      }
      if (currentResult.logicalOperator === LogicalOperator.or || currentResult.logicalOperator === LogicalOperator.orNot) {
        logicalResults[i - 1] = result;
        logicalResults.splice(i, 1);
      } else {
        throw new Error('reduceOrs encountered an "and" which should never happen');
      }
    }
    if (logicalResults.length !== 1) {
      throw new Error('Unexpected result after reduceOrs, there should one and only one result');
    }
    return logicalResults[0];
  }

  private static awaitEvaluation(logicalConditionGroup: LogicalConditionGroup, item: any, scope: LogicalConditionScope, ec?: LogExecutionContext): LogicalConditionResult | Promise<LogicalConditionResult> {
    const log = new LoggerAdapter(ec, 'rules-engine', 'logical-condition-group', LogicalConditionGroup.name + ':evaluate');
    if (logicalConditionGroup) {
      const logicalResults: LogicalConditionResult[] = [];
      const logicalResultsPromises: Promise<boolean | LogicalConditionResult>[] = [];
      // Keep track whether even one promise exists
      let hasPromises = false;
      logicalConditionGroup.conditions.forEach(element => {
        if (isLogicalCondition(element)) {
          const conditionResult = element.condition.awaitEvaluation(item, scope, ec);
          if (isPromise(conditionResult)) {
            // At least one promise
            // Add partial logical result
            // Add promise
            hasPromises = true;
            logicalResults.push({logicalOperator: element.operator, result: undefined});
            logicalResultsPromises.push(conditionResult);
          } else {
            // Not a promise
            // Add full logical result to both arrays
            // Add undefined promise
            logicalResults.push({logicalOperator: element.operator, result: conditionResult});
            logicalResultsPromises.push(undefined);
          }
        } else {
          const subResult = LogicalConditionGroup.awaitEvaluation(element, item, scope, ec);
          if (isPromise(subResult)) {
            // At least one promise
            // Add partial (undefined) logical result
            // Add promise
            hasPromises = true;
            logicalResultsPromises.push(subResult);
            logicalResults.push({logicalOperator: undefined, result: undefined});
          } else {
            // Not a promise
            // Add full result
            // Add undefined promise
            logicalResults.push(subResult);
            logicalResultsPromises.push(undefined);
          }
        }
      });
      // We now have two arrays of the same size, one containing results or partial results, another containing any
      // promises or undefined.  We've also kept track if any promises have been encountered.  If even one promise
      // was encountered, we treat the whole thing as async, otherwise we ignore the promise array
      if (hasPromises) {
        return Promise.all(logicalResultsPromises)
          .then(settledPromises => {
            settledPromises.forEach((settled, index) => {
              if (settled !== undefined) {
                if (typeof settled === 'boolean') {
                  logicalResults[index].result = settled;
                } else {
                  logicalResults[index].logicalOperator = settled.logicalOperator;
                  logicalResults[index].result = settled.result;
                }
              }
            });
            return LogicalConditionGroup.reduce(logicalConditionGroup.operator, logicalResults);
          });
      } else {
        return LogicalConditionGroup.reduce(logicalConditionGroup.operator, logicalResults);
      }
    } else {
      throw new Error('No logical condition group');
    }
  }

  awaitEvaluation(item: any, scope: LogicalConditionScope, ec?: LogExecutionContext): LogicalConditionResult | Promise<LogicalConditionResult> {
    return LogicalConditionGroup.awaitEvaluation(this, item, scope, ec);
  }

  to(ec?: LogExecutionContext): LogicalConditionGroupReference {
    const topRef: Partial<LogicalConditionGroupReference> = {};
    topRef.operator = this.operator;
    topRef.group = [];
    this.conditions.forEach((conditionOrGroup, ndx) => {
      if (isLogicalConditionGroup(conditionOrGroup)) {
        topRef.group.push(conditionOrGroup.to(ec));
      } else {
        topRef.group.push({operator: conditionOrGroup.operator, reference: conditionOrGroup.condition.to(ec)});
      }
    });
    return topRef as LogicalConditionGroupReference;
  }
}

/*
  return new Promise<LogicalConditionResult>((resolve, reject) => {
      if (logicalConditionGroup) {
        const logicalResults: LogicalConditionResult[] = [];
        const logicalResultPromises: Promise<boolean | LogicalConditionResult>[] = [];
        logicalConditionGroup.conditions.forEach(element => {
          if(isLogicalCondition(element)) {
            logicalResultPromises.push(element.condition.isValid(item, scope, ec));
            logicalResults.push({logicalOperator: element.operator, result: undefined});
          } else {
            logicalResultPromises.push(LogicalConditionGroup.evaluate(element, item, scope, ec));
            logicalResults.push({logicalOperator: undefined, result: undefined});
          }
        });
        // We have collected two parallel arrays of same size, one where put the final values (undefined for now) and one where
        // we stored either boolean promises or LogicalConditionResultPromises.
        Promise.all(logicalResultPromises)
          .then(promisedResults => {
            promisedResults.forEach((promisedResult, index) => {
              if (typeof promisedResult === 'boolean') {
                logicalResults[index].result = promisedResult;
              } else {
                logicalResults[index] = {
                  logicalOperator: promisedResult.logicalOperator,
                  result: promisedResult.result
                };
              }
            });
            resolve(LogicalConditionGroup.reduce(logicalConditionGroup.operator, logicalResults));
          })
          .catch(err => {
            reject(err);
          });
      } else {
        reject('No logical condition group');
      }
    });
 */

