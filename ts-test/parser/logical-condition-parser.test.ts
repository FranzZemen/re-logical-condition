import {isFragment, isRecursiveGrouping, LogicalOperator} from '@franzzemen/re-common';
import {isValueExpressionReference, StandardExpressionType} from '@franzzemen/re-expression';
import chai from 'chai';
import 'mocha';
import {LogicalConditionParser, LogicalConditionScope} from '../../publish/index.js';


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
const parser = new LogicalConditionParser();

/*
Note that recursive grouping tests are done more comprehensively in their own test file
 */


describe('Rules Engine Tests', () => {
  describe('Logical Condition Parser Tests', () => {
    describe('core/logical-condition/parser/logical-condition-parser.test', () => {
      it('should create no reference for empty ""', done => {
        let [remaining, ref] = parser.parse('', scope, operators, defaultOperator, endConditionTests);
        remaining.length.should.equal(0);
        expect(ref).to.be.undefined;
        done();
      });
      it('should create a simple rule 5.0 < 6.0', done => {
        let [remaining, ref] = parser.parse('5.0 < 6.0', scope, operators, defaultOperator, endConditionTests);
        ref.group.length.should.equal(1);
        if (isFragment(ref.group[0])) {
          if (isValueExpressionReference(ref.group[0].reference.lhsRef)) {
            ref.group[0].reference.lhsRef.value.should.equal(5.0);
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
        done();
      });
      it('should create a compound rule 5.0 < 6.0 and 4.5 = 4.5', done => {
        let [remaining, ref] = parser.parse('5.0 < 6.0 and 4.5 = 4.5', scope, operators, defaultOperator, endConditionTests);
        ref.group.length.should.equal(2);
        ref.operator.should.equal(LogicalOperator.and);
        if (isFragment(ref.group[0])) {
          if (isValueExpressionReference(ref.group[0].reference.lhsRef)) {
            ref.group[0].reference.lhsRef.value.should.equal(5.0);
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
        isFragment(ref.group[1]).should.be.true; // Not actually testing the condition, it has its own tests
        done();
      });
      it('should create a nested rule 5.0 < 6.0 or (4.5 = 4.5 or 3.3 = 3.3)', done => {
        let [remaining, ref] = parser.parse('5.0 < 6.0 or (4.5 = 4.5 or not 3.3 = 3.3', scope, operators, defaultOperator, endConditionTests);
        ref.group.length.should.equal(2);
        ref.operator.should.equal(LogicalOperator.and);
        if (isFragment(ref.group[0])) {
          if (isValueExpressionReference(ref.group[0].reference.lhsRef)) {
            ref.group[0].reference.lhsRef.value.should.equal(5.0);
          } else {
            unreachableCode.should.be.true;
          }
        } else {
          unreachableCode.should.be.true;
        }
        if (isRecursiveGrouping(ref.group[1])) {
          ref.group[1].operator.should.equal(LogicalOperator.or);
          ref.group[1].group.length.should.equal(2);
          isFragment(ref.group[1].group[0]).should.be.true;
          ref.group[1].group[1].operator.should.equal(LogicalOperator.orNot);
          isFragment(ref.group[1].group[1]).should.be.true;
        } else {
          unreachableCode.should.be.true;
        }
        done();
      });
      it('it should parse simple top level rule "Hello" = world', done => {
        const [remaining, result] = parser.parse('"Hello" = world', scope, operators, LogicalOperator.and, endConditionTests);
        if (isFragment(result.group[0])) {
          result.group[0].reference.rhsRef.type.should.equal(StandardExpressionType.Attribute);
        } else {
          unreachableCode.should.be.true;
        }
        done();
      });
    });
  });
});



