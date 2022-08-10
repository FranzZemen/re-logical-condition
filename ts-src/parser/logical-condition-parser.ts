import {LogicalOperator, RecursiveGroupingParser} from '@franzzemen/re-common';
import {ConditionParser, ConditionReference} from '@franzzemen/re-condition';

export class LogicalConditionParser extends RecursiveGroupingParser<LogicalOperator, ConditionReference> {
  constructor() {
    super(new ConditionParser());
  }
}
