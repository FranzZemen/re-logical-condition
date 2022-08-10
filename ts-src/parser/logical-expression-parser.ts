import {ExecutionContextI, Hints, LoggerAdapter} from '@franzzemen/app-utility';
import {EndConditionType, FragmentParser, LogicalOperator, RecursiveGroupingParser} from '@franzzemen/re-common';
import {StandardDataType} from '@franzzemen/re-data-type';
import {
  ExpressionHintKey,
  ExpressionParser,
  ExpressionReference,
  ExpressionScope,
  ExpressionStackParser,
  ExpressionType
} from '@franzzemen/re-expression';
import {LogicalExpressionReference} from '../expression/logical-expression';



const logicalOperators = [LogicalOperator.andNot, LogicalOperator.and, LogicalOperator.orNot, LogicalOperator.or];

class FragmentParserAdapter implements FragmentParser<ExpressionReference> {
  parse(fragment: string, scope: ExpressionScope, ec?: ExecutionContextI): [string, ExpressionReference] {
    const log = new LoggerAdapter(ec, 'rules-engine', 'logical-expression-parser', `${FragmentParserAdapter.name}.parse`)
    const parser = scope.get(ExpressionScope.ExpressionStackParser) as ExpressionStackParser;
    let [remaining, expresssion] =  parser.parse(fragment, scope, undefined, ec);
    if(expresssion.dataTypeRef !== StandardDataType.Boolean) {
      const err = new Error (`A fragment expression in a Logical Expression needs to be of type Boolean, not ${expresssion.dataTypeRef}`);
      log.error(err);
      throw err;
    }
    return [remaining, expresssion];
  }
}


export class LogicalExpressionParser extends ExpressionParser {
  constructor() {
    super(ExpressionType.Logical);
  }

  parse(remaining: string, scope: ExpressionScope, hints: Hints, allowUndefinedDataType?: boolean, ec?: ExecutionContextI): [string, LogicalExpressionReference] {
    const log = new LoggerAdapter(ec, 'rules-engine', 'logical-expression-parser', 'parse');

    let type = hints.get(ExpressionHintKey.ExpressionType) as string;
    if(type && type !== ExpressionType.Logical) {
      // Helps the inference parser know this is not the parser required
      return [remaining, undefined];
    } else {
      type = ExpressionType.Logical;
    }
    let dataTypeRef = hints.get(ExpressionHintKey.DataType) as string;
    if(dataTypeRef && dataTypeRef !== StandardDataType.Boolean) {
      // Can't be a Logical Expression as the Data Type is always Boolean
      return [remaining, undefined];
    } else {
      dataTypeRef = StandardDataType.Boolean;
    }
    if(remaining.startsWith('?:[')) {
      remaining = remaining.substring(3);
    } else {
      return [remaining, undefined];
    }
    const recursiveParser = new RecursiveGroupingParser<LogicalOperator, ExpressionReference>(new FragmentParserAdapter());
    let logicalExpressionReference: Partial<LogicalExpressionReference>;
    let endCondition: EndConditionType;
    [remaining, logicalExpressionReference, endCondition] = recursiveParser.parse(remaining, scope, logicalOperators, LogicalOperator.and, [/^][^]*$/], ec);
    logicalExpressionReference.type = type;
    logicalExpressionReference.dataTypeRef = dataTypeRef;
    if (endCondition === EndConditionType.GroupingEnd) {
      remaining = remaining.substring(1);
    } else {
      const err = new Error ('Expected closing of logical expression with ]');
      log.error(err);
      throw err;
    }
    return [remaining, logicalExpressionReference as LogicalExpressionReference];
  }

}
