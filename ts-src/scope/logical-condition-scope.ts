import {ExecutionContextI} from '@franzzemen/app-utility';
import {Scope} from '@franzzemen/re-common';
import {ConditionScope} from '@franzzemen/re-condition';
import {LogicalConditionOptions} from './logical-condition-options';

export class LogicalConditionScope extends ConditionScope {
  constructor(options?: LogicalConditionOptions, parentScope?: Scope, ec?: ExecutionContextI) {
    super(options, parentScope, ec);
  }
}
