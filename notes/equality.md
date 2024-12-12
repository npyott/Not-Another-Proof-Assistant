# Equality

## Type Based Equality

Currently, as part of the underlying type-checking mechanism,
a built-in congruence for types is included.
However, this congruence is very naive and not exposed from the core.

To get around this, a type `T` has an equality `= : T -> T -> Prop`,
where `x = y` for `x, y : T` is instead a proposition which can be proven or disproven.

This equality is assumed with axioms for each specified type, but iff can be derived as `P -> Q` and `Q -> P`, which is already a map `Prop -> Prop -> Prop`.

Since it is exceptionally common for a type to have its own proposition for equality,
it makes sense to implement some decorator like syntax when specifying that a new type has an equality.
Then, it becomes possible to write `x = y` with a common symbol since types are always known at declaration time.

## Substitution Principle

While an equivalence relation in mathematics is defined by three axioms,
type based equality instead requires only two powerful axioms.
For the two axioms, we only require reflexivity and substitution.

By substitution, we would like to say that two equal values can be interchanged and preserve equality,
somewhat related to the idea of transitivity.
That is, for a type `T` and members `x, y: T`,
if we have a proof of `x = y`,
then for any type `R: U` function `f : T -> R`,
we have a proof of `f(x) = f(y)`, using the type equality on `R`.

### Propositional Substitution

Unfortunately, the above assumes some notion of the extended universe in which `R` may ultimately reside.
To alleviate this, it actually suffices instead to replace `R` with `Prop`,
using iff as the usual propositional equality.

To see why, consider `f : T -> R` as above with a proof `x = y`.
Next, we construct a proposition `P : T -> Prop` by

```
P(t) <=> f(t) = f(y)
```

Thus, since `P(x) <=> f(x) = f(y)` and `P(y) <=> f(y) = f(y)`,
we may conclude by the propositional substitution that `P(x) <=> P(y)`,
and reflexivity of equality on `R` that `f(y) = f(y)`,
that we must have `f(x) = f(y)` as desired.

### Equivalence Relations

While we may deduce the equality axioms for iff based on definition alone,
transitivity and symmetry come for free if we assume propositional equality.

For example, let's have an equality on `T` which is reflexive and substitutes.
Moreover, let `x, y, z : T`.

If we assume we have `h1: x = y` and `h2: y = z`,
we can consider the proposition `P: T -> Prop` by `P(t) <=> t = z`.
Therefore, since `h2: P(y)` and `P(x) <=> P(y)`, we conclude a proof of `P(x)`,
which is the same as `x = z`.

Next, suppose we assume `h1: x = y` once again.
Using `P: T -> Prop` by `P(t) <=> y = t`,
we use reflexivity and `P(x) <=> P(y)` to obtain

```
y = x <=> P(x) <=> P(y) <=> y = y.
```

## Defining Functions

Consider a function `f: Nat -> Nat` given by

```
f(x) = x + 5
```

While it appears that `x + 5` defines `f` by supplying a method for performing beta substitution,
this underlying substitution is only available at the core and not by application.
Furthermore, notice that `f: Nat -> Nat` is the true definition.

To reconcile these issues, a simple solution is at play:
definitions use multiple steps at the core level.
Just as above, `f: Nat -> Nat` is the declaration of `f`,
while the equality statement is instead a proposition type
populated by the definition.

```
f: Nat -> Nat
definition_of_f: (x: Nat) -> f(x) = x + 5
```
