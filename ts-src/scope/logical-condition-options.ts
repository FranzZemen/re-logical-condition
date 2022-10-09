import {_mergeConditionOptions, ConditionOptions} from '@franzzemen/re-condition';

export interface LogicalConditionOptions extends ConditionOptions {

}

export function _mergeLogicalConditionOptions(target: LogicalConditionOptions, source: LogicalConditionOptions, mergeInto = true): LogicalConditionOptions {
  return _mergeConditionOptions(target, source, mergeInto);
}
