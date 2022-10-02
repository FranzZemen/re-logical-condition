import {ExecutionContextI} from '@franzzemen/app-utility';
import {Scope} from '@franzzemen/re-common';
import {ConditionScope} from '@franzzemen/re-condition';
import {ExpressionFactory, ExpressionScope, ExpressionStackParser} from '@franzzemen/re-expression';
import {LogicalExpressionParser} from '../parser/logical-expression-parser.js';
import {LogicalConditionOptions} from './logical-condition-options.js';

export class LogicalConditionScope extends ConditionScope {

  constructor(options?: LogicalConditionOptions, parentScope?: Scope, ec?: ExecutionContextI) {
    super(options, parentScope, ec);

    const parser = this.get(ExpressionScope.ExpressionStackParser) as ExpressionStackParser;
    parser.addParser(new LogicalExpressionParser(), false, ec);
  }
}
