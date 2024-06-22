# Binary Operations

Binary operations serve as the bread-and-butter of writing math computation.
While it is easy enough to ignore this special case,
many properties of binary axioms make it easier to read and write a computation.

## Prefix and Infix Operators

A binary operator on a type `T: U` is simply a map `op: (T, T) => T`.
As such, we may use common prefix notation for functions to write for `x, y, z: T`

```
op(x, op(y, z)).
```

However, this is not the common way most binary operators are written in mathematics.
By far, the most common

## Associativity

The first and most fundamental property is associativity.
If given a type `T: U` and operation `op: (T, T) -> T`,
we may run into chain of computations (using prefix operator notation) such as

```
op(op(x, y), op(z, w))
```

for `x, y, z, w: T`.
If we know that `op` is _associative_, then we may instead write using in-fix notation as

```
infix: x op y op z op w,
```

without any parentheses since the computation order is not important,
a long as the terms are never re-arranged.

Due to this, an operator which is either defined as associative,
or proven as such,
can be eligible to be written in in-fix notation.

To make this accessible for a front-end language,
you would need to expose a built-in such as

```
associative: (T: U) ->
    (op: (T, T) -> T) ->
        (x: T, y: T, z: T) ->
            Equal(
                op(op(x, y), z),
                op(x, op(y, z))
            )
```
