import {LogExecutionContext} from '@franzzemen/logger-adapter';
import {Scope} from '@franzzemen/re-common';
import {ConditionScope} from '@franzzemen/re-condition';
import {ExpressionScope, ExpressionStackParser} from '@franzzemen/re-expression';
import {LogicalExpressionParser} from '../parser/logical-expression-parser.js';
import {LogicalConditionGroupParser} from '../parser/logical-condition-group-parser.js'
import {ReLogicalCondition} from './logical-condition-execution-context.js';

export class LogicalConditionScope extends ConditionScope {
  static LogicalConditionParser = 'LogicalConditionParser';

  constructor(options?: ReLogicalCondition, parentScope?: Scope, ec?: LogExecutionContext) {
    super(options, parentScope, ec);

    const parser = this.get(ExpressionScope.ExpressionStackParser) as ExpressionStackParser;
    parser.addParser(new LogicalExpressionParser(), false, ec);
    this.set(LogicalConditionScope.LogicalConditionParser, new LogicalConditionGroupParser());
  }

  get options(): ReLogicalCondition {
    return this._options;
  }
}
