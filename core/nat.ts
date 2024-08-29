import { Prop, iff, implication, not } from "./prop.ts";
import { AbstractionExpression, Expression } from "./types.ts";
import {
    apply,
    independentFunctionType,
    makeAbstraction,
} from "./utilities.ts";

export const NatUniverse = Symbol("Nat Universe");
export const Nat = Symbol("Nat");

export const Zero = Symbol(0);
export const AsNat = (x: number): Expression => {
    if (x !== Math.round(x)) {
        throw new Error("Must be an integer.");
    }

    if (x < 0) {
        throw new Error("Must be a non-negative integer.");
    }

    if (x === 0) {
        return Zero;
    }

    return apply(Succ, AsNat(x - 1));
};

export const Succ = Symbol("succ");
export const succ = (n: Expression) => apply(Succ, n);

export const NatEq = Symbol("=");
export const equal = (x: Expression, y: Expression) => apply(NatEq, x, y);
export const NatEqReflexive = Symbol("reflexive");
export const NatRewrite = Symbol("rewrite");

export const SuccNeverZero = Symbol("succ !== zero");
export const SuccInjective = Symbol("succ injective");

export const forAllNaturalNumbers = (
    body: (...symbol: symbol[]) => Expression
): AbstractionExpression => {
    if (body.length <= 0) {
        throw new Error("Must accept at least one natural number.");
    }

    const declarations = new Array(body.length)
        .fill(null)
        .map(
            (_v, index) => [Symbol(`var_${index}`), Nat] as [symbol, Expression]
        );

    return makeAbstraction(declarations, body);
};

const NatSymbolicDeclarations = [
    {
        name: Nat,
        type: NatUniverse,
    },
    {
        name: Succ,
        type: independentFunctionType(Nat, Nat),
    },
    {
        name: Zero,
        type: Nat,
    },
    {
        name: NatEq,
        type: independentFunctionType([Nat, Nat], Prop),
    },
] as const;

const NatEqualityDeclarations = [
    {
        name: NatEqReflexive,
        type: forAllNaturalNumbers((a) => equal(a, a)),
    },
    {
        name: NatRewrite,
        type: forAllNaturalNumbers((a, b) =>
            makeAbstraction(
                [Symbol("P"), independentFunctionType(Nat, Prop)],
                (P) => implication(equal(a, b), iff(apply(P, a), apply(P, b)))
            )
        ),
    },
] as const;

const NatAxiomaticDeclarations = [
    {
        name: SuccNeverZero,
        type: forAllNaturalNumbers((n) => not(equal(succ(n), Zero))),
    },
    {
        name: SuccInjective,
        type: forAllNaturalNumbers((n, m) =>
            implication(equal(succ(n), succ(m)), equal(n, m))
        ),
    },
] as const;

export const NatDeclarations = [
    ...NatSymbolicDeclarations,
    ...NatEqualityDeclarations,
    ...NatAxiomaticDeclarations,
] as const;
