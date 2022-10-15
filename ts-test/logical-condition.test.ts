import 'mocha';
import {LogicalOperator} from '@franzzemen/re-common';
import chai from 'chai';
import {LogicalConditionGroup, LogicalConditionGroupParser, LogicalConditionScope} from '../publish/index.js';


const expect = chai.expect;
const should = chai.should();

let scope = new LogicalConditionScope();
let operators = [LogicalOperator.andNot, LogicalOperator.and, LogicalOperator.orNot, LogicalOperator.or];
let defaultOperator = LogicalOperator.and;
let endConditionTests = [
  /^$/,
  /^<<ap|rs|ru[^]*$/
];

const unreachableCode = false;
const parser = new LogicalConditionGroupParser();

describe('Rules Engine Tests', () => {
  describe('Logical Condition Tests', () => {
    describe('/core/logical-condition/logical-condition.test', () => {
      it('should covert to reference', done => {
        let [remaining, ref] = parser.parse('5.0 < 6.0 and 4.5 = 4.5', scope, operators, defaultOperator, endConditionTests);
        const lcond = new LogicalConditionGroup(ref,scope);
        const toRef = lcond.to();
        toRef.operator.should.equal(LogicalOperator.and);
        toRef.group.length.should.equal(2);
        toRef.group[0].operator.should.equal(LogicalOperator.and);
        toRef.group[1].operator.should.equal(LogicalOperator.and);
        done();
      })
    })
  })
})
