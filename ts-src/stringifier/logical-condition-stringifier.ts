import {LogExecutionContext} from '@franzzemen/logger-adapter';
import {isFragment, LogicalOperator} from '@franzzemen/re-common';
import {ConditionStringifier} from '@franzzemen/re-condition';
import {LogicalConditionGroupReference} from '../logical-condition-group-reference';
import {LogicalConditionScope} from '../scope/logical-condition-scope';
import {StringifyLogicalConditionOptions} from './stringify-logical-condition-options.js';


export class LogicalConditionStringifier {
  constructor() {
  }

  stringify(ref: LogicalConditionGroupReference, scope: LogicalConditionScope, options?: StringifyLogicalConditionOptions, ec?: LogExecutionContext, innerLogicalCondition = true): string {
    let stringified: string;
    if (innerLogicalCondition || ref.operator !== LogicalOperator.and) {
      // TODO: Any symbol could be used for brackets
      stringified = `${ref.operator} (`;
    } else {
      stringified = '';
    }
    let first = true;
    ref.group.forEach(elem => {
      if (isFragment(elem)) {
        const conditionStringifier = new ConditionStringifier();
        if (first && elem.operator === LogicalOperator.and) {
          stringified += `${conditionStringifier.stringify(elem.reference, scope, options, ec)}`;
        } else {
          stringified += ` ${elem.operator} ${conditionStringifier.stringify(elem.reference, scope, options, ec)}`;
        }
      } else {
        if (first) {
          stringified += `${this.stringify(elem, scope, options, ec, true)}`;
        } else {
          stringified += ` ${this.stringify(elem, scope, options, ec, true)}`;
        }
      }
      first = false;
    });
    if (innerLogicalCondition || ref.operator !== LogicalOperator.and) {
      stringified += ')';
    }
    return stringified;
  }
}
