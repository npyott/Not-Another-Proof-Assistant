# Sub-Types

## Inclusion

With the current implementation, sub-types are not generally not a thing.
Ideally, one would prefer to handle sub-typing with an _inclusion map_, but it is important that you don't need to re-implement all types.

For this, we'll consider the following notation for inclusions,

```
Inc: S -> T
```

where `S` will be the sub-type of `T`.
Note that these notes will continue with this notation.
This map is not without axioms, as it is required to be injective.

Potentially using some decorator notation,
it becomes possible to implicitly "cast" `S` as `T` by the inclusion map.

## Restriction Maps

To circumvent this, a sub-type requires two notions: inclusion and restriction.
Consider the sub-type `Inc: S -> T`.
What we would like for our restriction is that for any third type `R`,
we obtain a _restriction map_

```
Res: (T -> R) -> (S -> R)
```

such that for any `f: T -> R` and `x: S`,

```
Res(f)(x) = f(Inc(x))
```

With the restriction map, it becomes possible to implicitly "cast" functions on the super-type down to the sub-type.

## Conditional Types

Beginning with sets, we commonly see notation such as

-   `{ x : Nat | x <= 10 }`,
-   `(1, 7) = { x : Real | 1 < x < 7 }`,

where generally the above is captured by `S = { x : T | P(x)}`.

To capture this idea, using the subtype `(S, Inc, Res)` of `T`,
as well as the proposition `P: T -> Prop`,
we may consider `S` a conditional sub-type when we have a defining axiom

```
conditional_axiom : (x : S) -> P(Inc(x)),
```

where we may equivalently use `Res(P)(x)` instead as the function type.
