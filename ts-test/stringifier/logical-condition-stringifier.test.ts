import 'mocha';
import {LogicalOperator} from '@franzzemen/re-common';
import chai from 'chai';
import {LogicalConditionParser, LogicalConditionScope, LogicalConditionStringifier} from '../../publish/index.js';


const expect = chai.expect;
const should = chai.should();

const scope = new LogicalConditionScope();
const unreachableCode = false;
const parser = new LogicalConditionParser();
const stringifier = new LogicalConditionStringifier();
let endConditionTests = [
  /^$/,
  /^<<ap|rs|ru[^]*$/
]
let operators = [LogicalOperator.andNot, LogicalOperator.and, LogicalOperator.orNot, LogicalOperator.or];

/*
describe('Rules Engine Tests', () => {
  describe('Logical Condition Stringifier Tests', ()=> {
    describe('core/logical-condition/stringifier/logical-condition-stringifier.test', ()=> {
      it('should stringify simple top level rule "Hello" = world', done => {
        const [remaining, result] = parser.parse('"Hello" = world', scope, operators, LogicalOperator.and,  endConditionTests);
        const stringified = stringifier.stringify(result, scope, undefined, undefined, false);
        stringified.should.equal('"Hello" = world');
        done();
      })
      it('should stringify complext rule "Hello" = world or (5 > 6 and 4 < 3 or (9 = 8)) and (5 = 4 and 3 = 2)', done => {
        const [remaining, result] = parser.parse('"Hello" = world or (5 > 6 and 4 < 3 or (9 = 8)) and (5 = 4 and 3 = 2)', scope, operators, LogicalOperator.and,  endConditionTests);
        const stringified = stringifier.stringify(result, scope, undefined, undefined, false);
        stringified.should.equal('"Hello" = world or (5 > 6 and 4 < 3 or (9 = 8)) and (5 = 4 and 3 = 2)');
        done();
      })
    })
  })
})


 */
