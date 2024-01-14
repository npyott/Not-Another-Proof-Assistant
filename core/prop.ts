import { independentFunctionType, makeAbstraction } from "./utilities";

export const PropUniverse = Symbol("PropUniverse");
export const Prop = Symbol("Prop");

export const False = Symbol("False");
export const FalseImpliesAll = Symbol("False => Any");
export const NotSymbol = Symbol("Not");
export const Not = (P: Expression): ApplicationExpression => ({
    expressionType: "application",
    function: NotSymbol,
    arguments: [P],
});
export const NotImplication = Symbol("Not Implication");
export const NotFormation = Symbol("Not Formation");

export const AndSymbol = Symbol("And");
export const And = (P: Expression, Q: Expression): ApplicationExpression => ({
    expressionType: "application",
    function: AndSymbol,
    arguments: [P, Q],
});
export const AndLeft = Symbol("Left");
export const AndRight = Symbol("Right");
export const AndFormation = Symbol("And Formation");

export const OrSymbol = Symbol("Or");
export const Or = (P: Expression, Q: Expression): ApplicationExpression => ({
    expressionType: "application",
    function: OrSymbol,
    arguments: [P, Q],
});
export const ApplyOrLeft = Symbol("Or Left");
export const ApplyOrRight = Symbol("Or Right");
export const ConcludeFromOr = Symbol("Or Both");
export const OrFormationLeft = Symbol("Or Formation From Left");
export const OrFormationRight = Symbol("Or Formation From Right");

export const ExcludedMiddle = Symbol("Excluded Middle");

export const iff = (P: Expression, Q: Expression) =>
    And(implication(P, Q), implication(Q, P));

export const forAllPropositions = (
    body: (...symbol: symbol[]) => Expression
): AbstractionExpression => {
    if (body.length <= 0) {
        throw new Error("Must accept at least one proposition.");
    }

    const declarations = new Array(body.length)
        .fill(null)
        .map(
            (_v, index) =>
                [Symbol(`var_${index}`), Prop] as [symbol, Expression]
        );

    return makeAbstraction(declarations, body);
};

export const implication = (
    premises: Expression | Expression[],
    conclusion: Expression
): AbstractionExpression => independentFunctionType(premises, conclusion);

export const PropDeclarations: Declaration[] = [
    {
        name: Prop,
        type: PropUniverse,
    },
    {
        name: False,
        type: Prop,
    },
    {
        name: FalseImpliesAll,
        type: forAllPropositions((P) => implication(False, P)),
    },
    {
        name: NotSymbol,
        type: independentFunctionType(Prop, Prop),
    },
    {
        name: NotImplication,
        type: forAllPropositions((P) =>
            implication(Not(P), implication(P, False))
        ),
    },
    {
        name: NotFormation,
        type: forAllPropositions((P) =>
            implication(implication(P, False), Not(P))
        ),
    },
    {
        name: AndSymbol,
        type: independentFunctionType([Prop, Prop], Prop),
    },
    {
        name: AndLeft,
        type: forAllPropositions((P, Q) => implication(And(P, Q), P)),
    },
    {
        name: AndRight,
        type: forAllPropositions((P, Q) => implication(And(P, Q), Q)),
    },
    {
        name: AndFormation,
        type: forAllPropositions((P, Q) => implication([P, Q], And(P, Q))),
    },
    {
        name: OrSymbol,
        type: independentFunctionType([Prop, Prop], Prop),
    },
    {
        name: ApplyOrLeft,
        type: forAllPropositions((P, Q, R) =>
            implication([Or(P, Q), implication(P, R)], Or(R, Q))
        ),
    },
    {
        name: ApplyOrRight,
        type: forAllPropositions((P, Q, R) =>
            implication([Or(P, Q), implication(Q, R)], Or(P, R))
        ),
    },
    {
        name: ConcludeFromOr,
        type: forAllPropositions((P) => implication(Or(P, P), P)),
    },
    {
        name: OrFormationLeft,
        type: forAllPropositions((P, Q) => implication(P, Or(P, Q))),
    },
    {
        name: OrFormationRight,
        type: forAllPropositions((P, Q) => implication(Q, Or(P, Q))),
    },
    {
        name: ExcludedMiddle,
        type: forAllPropositions((P) => Or(P, Not(P))),
    },
];
