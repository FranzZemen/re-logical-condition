#Logical Expressions

Logical Expressions are similar to Formula Expressions; whereas Formula Expressions combine other Expressions 
through _Operators_ operating on potentially any Data Type and resulting in a specific Data Type, Logical Expressions 
combine other expressions through _Logical Operators_ operating only on Boolean Data Types.  Thus the Expressions in 
a Logical Expression must have Data Type Boolean or result in a Data Type Boolean.

Logical Expressions are also closely related to Logical Conditions. The difference is that a Logical Condition is always
the next construct in a Logical Rule, and contains Conditions whereas a Logical Expression can be used anywhere it is needed
as an Expression, and it contains any Expression, as long as that Expression (or a result of) has the Boolean Data Type.

## Logical Operators
The logical operators are:

    and
    and not
    or
    or not

The reader may satisfy themselves that any logical combination can be met with these operators, also noting that 
nesting is allowed and that "and" is precedent over "or".

## Nesting
A Logical Expression can have nesting in order to create logical statements like A and (B or C).  Any amount and 
variety of nesting is allowed.

## Data Type
The Data Type for a Logical Expression is always Boolean

## Reference Format
To better understand the Reference Format, see [Recursive Grouping](../recursive-grouping/RecursiveGrouping.md).

Based on that documention, the reference format is:

    interface Fragment {
    { 
        operator: LogicalOperator;
        reference: Expression;
    }

    interface RecursiveGrouping {
        operator: LogicalOperator;
        group: (Fragment | RecursiveGrouping) [];
    }

## Text Format
The Text Format follows the following forms:

    <ex type=Logical>> [list of expressions or recursive groups]

    ?:[list of expressions or recursive groups]

    <ex type=Logical>> ?:[list of expressions or recursive groups]
    
Therefore, either the type hint or the notation ?: must be used (or both), followed by content in square brackets.  
If the prefix ?: is used, there must be no whitespace between it and the opening square bracket.

What is contained in the square brackets is a logical statement of Expressions, normal "(" and ")" brackets and 
logical operators "and", "and not", "or", "or not".

For example:

    <ex type=Logical>> [stock.isSellable and (stock.priceIsRight or stock.valuationIsRight)]

or

    ?:[stock.isSellable and (stock.priceIsRight or stock.valuationIsRight)]
