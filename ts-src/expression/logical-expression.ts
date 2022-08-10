import {LogicalOperator, RecursiveGrouping} from '@franzzemen/re-common';
import {ExpressionReference, ExpressionType} from '@franzzemen/re-expression';

export function isLogicalExpressionReference(ref: any | LogicalExpressionReference): ref is LogicalExpressionReference {
  return ref['type'] === ExpressionType.Logical && 'operator' in ref && 'group' in ref;
}

export interface LogicalExpressionReference extends RecursiveGrouping<LogicalOperator, ExpressionReference>, ExpressionReference {
}
