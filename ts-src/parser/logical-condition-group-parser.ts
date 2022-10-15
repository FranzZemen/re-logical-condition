import {LogicalOperator, RecursiveGroupingParser} from '@franzzemen/re-common';
import {ConditionParser, ConditionReference} from '@franzzemen/re-condition';

export const endConditionTests = [
  /^$/,
  /^<<ap|rs|ru[^]*$/
]

export class LogicalConditionGroupParser extends RecursiveGroupingParser<LogicalOperator, ConditionReference> {
  constructor() {
    super(new ConditionParser());
  }
}
