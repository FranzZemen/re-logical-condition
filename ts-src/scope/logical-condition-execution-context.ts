/*
Created by Franz Zemen 11/06/2022
License Type: 
*/
import {AppExecutionContextDefaults, appSchemaWrapper} from '@franzzemen/app-execution-context';
import {ExecutionContextDefaults, executionSchemaWrapper} from '@franzzemen/execution-context';
import {LogExecutionContextDefaults, logSchemaWrapper} from '@franzzemen/logger-adapter';
import {CommonExecutionContextDefaults, commonOptionsSchemaWrapper} from '@franzzemen/re-common';
import {ConditionExecutionContext, ConditionExecutionContextDefaults, ReCondition} from '@franzzemen/re-condition';
import {DataTypeExecutionContextDefaults, dataTypeOptionsSchemaWrapper} from '@franzzemen/re-data-type';
import {ExpressionExecutionContextDefaults, expressionOptionsSchemaWrapper} from '@franzzemen/re-expression';
import Validator, {ValidationError} from 'fastest-validator';
import {isPromise} from 'util/types';

export interface LogicalConditionOptions {
}

export interface ReLogicalCondition extends ReCondition {
  logicalCondition?: LogicalConditionOptions;
}

export interface LogicalConditionExecutionContext extends ConditionExecutionContext {
  re?: ReLogicalCondition;
}

export class LogicalConditionExecutionContextDefaults {
  static LogicalConditionOptions: LogicalConditionOptions = {
  }
  static ReLogicalCondition: ReLogicalCondition = {
    common: CommonExecutionContextDefaults.CommonOptions,
    data: DataTypeExecutionContextDefaults.DataTypeOptions,
    expression: ExpressionExecutionContextDefaults.ExpressionOptions,
    condition: ConditionExecutionContextDefaults.ConditionOptions,
    logicalCondition: LogicalConditionExecutionContextDefaults.LogicalConditionOptions
  }
  static LogicalConditionExecutionContext: LogicalConditionExecutionContext = {
    execution: ExecutionContextDefaults.Execution(),
    app: AppExecutionContextDefaults.App,
    log: LogExecutionContextDefaults.Log,
    re: LogicalConditionExecutionContextDefaults.ReLogicalCondition
  };
}

export const conditionOptionsSchema = {
};

export const logicalConditionOptionsSchemaWrapper = {
  type: 'object',
  optional: true,
  default: LogicalConditionExecutionContextDefaults.LogicalConditionOptions,
  props: conditionOptionsSchema
};

const reLogicalConditionSchema = {
  common: commonOptionsSchemaWrapper,
  data: dataTypeOptionsSchemaWrapper,
  expression: expressionOptionsSchemaWrapper,
  condition: logicalConditionOptionsSchemaWrapper,
};

export const reLogicalConditionSchemaWrapper = {
  type: 'object',
  optional: true,
  default: LogicalConditionExecutionContextDefaults.ReLogicalCondition,
  props: reLogicalConditionSchema
};


export const logicalConditionExecutionContextSchema = {
  execution: executionSchemaWrapper,
  app: appSchemaWrapper,
  log: logSchemaWrapper,
  re: reLogicalConditionSchemaWrapper
};

export const logicalConditionExecutionContextSchemaWrapper = {
  type: 'object',
  optional: true,
  default: LogicalConditionExecutionContextDefaults.LogicalConditionExecutionContext,
  props: logicalConditionExecutionContextSchema
};


export function isLogicalConditionExecutionContext(options: any | LogicalConditionExecutionContext): options is LogicalConditionExecutionContext {
  return options && 're' in options; // Faster than validate
}

const check = (new Validator({useNewCustomCheckerFunction: true})).compile(logicalConditionExecutionContextSchema);

export function validate(context: LogicalConditionExecutionContext): true | ValidationError[] {
  const result = check(context);
  if (isPromise(result)) {
    throw new Error('Unexpected asynchronous on LogicalConditionExecutionContext validation');
  } else {
    if (result === true) {
      context.validated = true;
    }
    return result;
  }
}


