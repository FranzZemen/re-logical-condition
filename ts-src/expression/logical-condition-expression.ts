import {logErrorAndThrow} from '@franzzemen/enhanced-error';
import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {Fragment, isFragment, LogicalOperator, RecursiveGrouping} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';
import {
  Expression,
  ExpressionFactory,
  ExpressionReference,
  ExpressionScope,
  ExpressionType
} from '@franzzemen/re-expression';
import {LogicalConditionScope} from '../scope/logical-condition-scope.js';

export enum LogicalConditionExpressionType {
  Logical = 'Logical'
}


export function isLogicalExpressionReference(ref: any | LogicalConditionExpressionReference): ref is LogicalConditionExpressionReference {
  return ref['type'] === LogicalConditionExpressionType.Logical && 'operator' in ref && 'group' in ref;
}

export interface LogicalConditionExpressionReference extends RecursiveGrouping<LogicalOperator, ExpressionReference>, ExpressionReference {
}


export class LogicalExpression {
  operator: LogicalOperator;
  expression: Expression;

  constructor(ref: Fragment<LogicalOperator, ExpressionReference>, scope: LogicalConditionScope, ec?: LogExecutionContext) {
    this.operator = ref.operator;
    if(ref.reference.dataTypeRef === StandardDataType.Unknown || ref.reference.dataTypeRef === StandardDataType.Boolean) {
      const expressionFactory = scope.get(ExpressionScope.ExpressionFactory) as ExpressionFactory;
      this.expression = expressionFactory.createExpression(ref.reference, scope, ec);
    } else {
      const log = new LoggerAdapter(ec, 're-logical-condition', 'logical-condition-expression', 'LogicalExpression constructor');
      logErrorAndThrow('reference data type is not Boolean or Unknown', log);
    }
    if (!scope.isResolved()) {
      const log = new LoggerAdapter(ec, 're-logical-condition', 'logical-condition-expression', 'LogicalExpression constructor');
      log.debug({scope}, 'Scope needs to be externally resolved');
    }
  }
}


export function isLogicalExpression(exp: any | LogicalExpression): exp is LogicalExpression {
  return exp instanceof LogicalExpression;
}

export function isLogicalConditionExpression(exp: any | LogicalConditionExpression): exp is LogicalConditionExpression {
  return exp instanceof LogicalConditionExpression;
}

export type LogicalConditionExpressionGroup = (LogicalExpression | LogicalConditionExpression)[];

export class LogicalConditionExpression extends Expression {
  operator: LogicalOperator;
  group: LogicalConditionExpressionGroup = [];

  constructor(ref: LogicalConditionExpressionReference, scope: LogicalConditionScope, ec?: LogExecutionContext) {
    super(ref, scope, ec);
    this.operator = ref.operator;
    ref.group.forEach(element => {
      if(isFragment(element)) {
        this.group.push(new LogicalExpression(element, scope, ec));
      } else if(isLogicalConditionExpression(element)) {
        this.group.push(new LogicalConditionExpression(element, scope, ec));
      }
    });
    if (!scope.isResolved()) {
      const log = new LoggerAdapter(ec, 're-logical-condition', 'logical-condition-expression', 'LogicalConditionExpression constructor');
      log.debug({scope}, 'Scope needs to be externally resolved');
    }
  }


  awaitEvaluation(dataDomain: any, scope: Map<string, any>, ec?: LogExecutionContext): any {
  }

  to(ec?: LogExecutionContext): LogicalConditionExpressionReference {
    return undefined;
  }

}
