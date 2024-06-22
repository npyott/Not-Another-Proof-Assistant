# Algebraic Structures

In mathematics, it is often suitable to know a result about a specific structure by first proving it for an algebraic abstraction.
For example, if `x: Int`, since `Int` is a ring,
we know

```
(x + 1)(x - 1) = x^2 - 1.
```

## Axioms as an Interface

As is common in mathematics,
algebraic structures are defined by their own specific axioms.
This allows for proving things using only the abstraction and obtaining theorems about the specifics.

For example, let's consider a group `G: Type` with binary operation `*: (G, G) => G`, identity `e: G`, and equality `= : (G, G) -> Prop`.
We have the following group axioms:

```
identity: (g: G) => *(e, g) = g
associative: (a: G, b: G, c: G) => *(a, *(b, c)) = *(*(a, b), c)
inverse: (a: G) => Exists. (b: G) => *(a, b) = e
```

Using a TS like syntax, we can introduce a group in the pre-amble as follows:

```
(G: Type) =>
    (e: G, *: (G, G) => G) =>
        (
            identity: (g: G) => *(e, g) = g,
            associative: (a: G, b: G, c: G) => *(a, *(b, c)) = *(*(a, b), c),
            inverse:
        ) => ...
```

However, this is clearly way too verbose.
Thus, it makes sense to include macros for specific structures.

```
({G, e: 0, *: +, identity: zero, }: @Group) => ....
```

where you can remap the base definitions to avoid scope issues or use a more sensible name.
