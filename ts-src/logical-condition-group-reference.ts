import {LogicalOperator, RecursiveGrouping} from '@franzzemen/re-common';
import {ConditionReference} from '@franzzemen/re-condition';
import {LogicalConditionGroup} from './logical-condition-group.js';


export function isLogicalConditionGroupReference(ref: LogicalConditionGroup | LogicalConditionGroupReference) : ref is LogicalConditionGroupReference {
  return 'operator' in ref && 'group' in ref;
}

export interface LogicalConditionGroupReference extends RecursiveGrouping<LogicalOperator, ConditionReference> {
}
