import {_mergeConditionOptions, ConditionOptions} from '@franzzemen/re-condition';

export interface LogicalConditionOptions extends ConditionOptions {

}

export function _mergeLogicalConditionOptions(source: LogicalConditionOptions, target: LogicalConditionOptions, mergeInto = true): LogicalConditionOptions {
  return _mergeConditionOptions(source, target, mergeInto);
}
