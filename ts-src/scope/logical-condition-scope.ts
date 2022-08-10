import {ExecutionContextI} from '@franzzemen/app-utility';
import {ConditionScope} from '@franzzemen/re-condition';
import {LogicalConditionOptions} from './logical-condition-options';

export class LogicalConditionScope extends ConditionScope {
  constructor(options?: LogicalConditionOptions, ec?: ExecutionContextI) {
    super();
  }
}
