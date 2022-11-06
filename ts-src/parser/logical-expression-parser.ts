import {Hints} from '@franzzemen/hints';
import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {
  EndConditionType,
  FragmentParser,
  LogicalOperator,
  ParserMessages,
  ParserMessageType,
  RecursiveGroupingParser
} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';
import {
  ExpressionHintKey,
  ExpressionParser,
  ExpressionReference,
  ExpressionScope,
  ExpressionStackParser
} from '@franzzemen/re-expression';
import {
  LogicalConditionExpressionReference,
  LogicalConditionExpressionType
} from '../expression/logical-condition-expression.js';


export const logicalOperators = [LogicalOperator.andNot, LogicalOperator.and, LogicalOperator.orNot, LogicalOperator.or];

class FragmentParserAdapter implements FragmentParser<ExpressionReference> {
  parse(fragment: string, scope: ExpressionScope, ec?: LogExecutionContext): [string, ExpressionReference, ParserMessages] {
    const log = new LoggerAdapter(ec, 'rules-engine', 'logical-expression-parser', `${FragmentParserAdapter.name}.parse`);
    const near = fragment;
    const parserMessages: ParserMessages = [];
    const parser = scope.get(ExpressionScope.ExpressionStackParser) as ExpressionStackParser;
    let [remaining, expression] =  parser.parse(fragment, scope, undefined, ec);
    if(expression.dataTypeRef !== StandardDataType.Boolean) {
      parserMessages.push({message:`Fragment expression in a Logical Expression needs to be of type Boolean, not ${expression.dataTypeRef}, near ${near}`, type: ParserMessageType.Error});
      return [undefined, undefined, parserMessages]
    }
    return [remaining, expression, undefined];
  }
}


export class LogicalExpressionParser extends ExpressionParser {
  constructor() {
    super(LogicalConditionExpressionType.Logical);
  }

  parse(remaining: string, scope: ExpressionScope, hints: Hints, ec?: LogExecutionContext): [string, LogicalConditionExpressionReference, ParserMessages] {
    const log = new LoggerAdapter(ec, 'rules-engine', 'logical-expression-parser', 'parse');

    let type = hints.get(ExpressionHintKey.Type) as string;
    if(type && type !== LogicalConditionExpressionType.Logical) {
      // Helps the inference parser know this is not the parser required
      return [remaining, undefined, undefined];
    } else {
      type = LogicalConditionExpressionType.Logical;
    }
    let dataTypeRef = hints.get(ExpressionHintKey.DataType) as string;
    if(dataTypeRef && dataTypeRef !== StandardDataType.Boolean) {
      // Can't be a Logical Expression as the Data Type is always Boolean
      return [remaining, undefined, undefined];
    } else {
      dataTypeRef = StandardDataType.Boolean;
    }
    if(remaining.startsWith('?:[')) {
      remaining = remaining.substring(3);
    } else {
      return [remaining, undefined, undefined];
    }
    const recursiveParser = new RecursiveGroupingParser<LogicalOperator, ExpressionReference>(new FragmentParserAdapter());
    let logicalExpressionReference: Partial<LogicalConditionExpressionReference>;
    let endCondition: EndConditionType;
    [remaining, logicalExpressionReference, endCondition] = recursiveParser.parse(remaining, scope, logicalOperators, LogicalOperator.and, [/^][^]*$/], undefined, ec);
    logicalExpressionReference.type = type;
    logicalExpressionReference.dataTypeRef = dataTypeRef;
    if (endCondition === EndConditionType.GroupingEnd) {
      remaining = remaining.substring(1);
    } else {
      const err = new Error ('Expected closing of logical expression with ]');
      log.error(err);
      throw err;
    }
    return [remaining, logicalExpressionReference as LogicalConditionExpressionReference, undefined];
  }

}
