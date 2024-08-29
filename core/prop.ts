import {
    Expression,
    ApplicationExpression,
    AbstractionExpression,
    betaReduce,
    Type,
} from "./types.ts";
import {
    apply,
    independentFunctionType,
    makeAbstraction,
} from "./utilities.ts";

export const Prop = Symbol("Prop");

export const False = Symbol("False");
export const FalseImpliesAll = Symbol("False => Any");
export const Not = Symbol("Not");
export const not = (P: Expression): ApplicationExpression => apply(Not, P);
export const NotImplication = Symbol("Not Implication");
export const NotFormation = Symbol("Not Formation");

export const And = Symbol("And");
export const and = (P: Expression, Q: Expression) => apply(And, P, Q);
export const AndLeft = Symbol("Left");
export const AndRight = Symbol("Right");
export const AndFormation = Symbol("And Formation");

export const Or = Symbol("Or");
export const or = (P: Expression, Q: Expression): ApplicationExpression => ({
    expressionType: "application",
    function: Or,
    arguments: [P, Q],
});
export const ApplyOrLeft = Symbol("Or Left");
export const ApplyOrRight = Symbol("Or Right");
export const ConcludeFromOr = Symbol("Or Both");
export const OrFormationLeft = Symbol("Or Formation From Left");
export const OrFormationRight = Symbol("Or Formation From Right");

export const ExcludedMiddle = Symbol("Excluded Middle");

export const Iff = Symbol("<=>");
export const iff = (P: Expression, Q: Expression) => apply(Iff, P, Q);
export const IffFormation = Symbol("IffFormation");
export const IffDefinition = Symbol("IffDefinition");
export const IffRewrite = Symbol("rewrite");

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

const PropSymbolicDeclarations = [
    {
        name: Prop,
        type: Type,
    },
    {
        name: False,
        type: Prop,
    },
    {
        name: Not,
        type: independentFunctionType(Prop, Prop),
    },
    {
        name: And,
        type: independentFunctionType([Prop, Prop], Prop),
    },
    {
        name: Or,
        type: independentFunctionType([Prop, Prop], Prop),
    },
    {
        name: Iff,
        type: independentFunctionType([Prop, Prop], Prop),
    },
] as const;

const PropAxiomaticDeclarations = [
    {
        name: FalseImpliesAll,
        type: forAllPropositions((P) => implication(False, P)),
    },
    {
        name: NotImplication,
        type: forAllPropositions((P) =>
            implication(not(P), implication(P, False))
        ),
    },
    {
        name: NotFormation,
        type: forAllPropositions((P) =>
            implication(implication(P, False), not(P))
        ),
    },
    {
        name: AndLeft,
        type: forAllPropositions((P, Q) => implication(and(P, Q), P)),
    },
    {
        name: AndRight,
        type: forAllPropositions((P, Q) => implication(and(P, Q), Q)),
    },
    {
        name: AndFormation,
        type: forAllPropositions((P, Q) => implication([P, Q], and(P, Q))),
    },
    {
        name: ApplyOrLeft,
        type: forAllPropositions((P, Q, R) =>
            implication([or(P, Q), implication(P, R)], or(R, Q))
        ),
    },
    {
        name: ApplyOrRight,
        type: forAllPropositions((P, Q, R) =>
            implication([or(P, Q), implication(Q, R)], or(P, R))
        ),
    },
    {
        name: ConcludeFromOr,
        type: forAllPropositions((P) => implication(or(P, P), P)),
    },
    {
        name: OrFormationLeft,
        type: forAllPropositions((P, Q) => implication(P, or(P, Q))),
    },
    {
        name: OrFormationRight,
        type: forAllPropositions((P, Q) => implication(Q, or(P, Q))),
    },
    {
        name: ExcludedMiddle,
        type: forAllPropositions((P) => or(P, not(P))),
    },
    {
        name: IffFormation,
        type: forAllPropositions((P, Q) =>
            implication(and(implication(P, Q), implication(Q, P)), iff(P, Q))
        ),
    },
    {
        name: IffDefinition,
        type: forAllPropositions((P, Q) =>
            implication(iff(P, Q), and(implication(P, Q), implication(Q, P)))
        ),
    },
    {
        name: IffRewrite,
        type: forAllPropositions((P, Q) =>
            makeAbstraction(
                [Symbol("R"), independentFunctionType(Prop, Prop)],
                (R) => implication(iff(P, Q), iff(apply(R, P), apply(R, Q)))
            )
        ),
    },
] as const;

export const PropDeclarations = [
    ...PropSymbolicDeclarations,
    ...PropAxiomaticDeclarations,
];

type PropAxiom = (typeof PropAxiomaticDeclarations)[number]["name"];

export const usePropAxioms = (
    axioms: { name: PropAxiom; reductions: Expression[] }[],
    body: (...axioms: symbol[]) => Expression
) =>
    apply(
        makeAbstraction(
            axioms.map(
                ({ name: axiomName, reductions }, index) =>
                    [
                        Symbol(`Axiom ${index + 1}`),
                        ((axiomType) =>
                            betaReduce(
                                axiomType,
                                ...reductions.map((value, index) => ({
                                    name: axiomType.variables[index].name,
                                    value,
                                }))
                            ))(
                            PropAxiomaticDeclarations.find(
                                ({ name }) => name === axiomName
                            )!.type
                        ),
                    ] as [symbol, Expression]
            ),
            body
        ),
        ...axioms.map(({ name, reductions }) => apply(name, ...reductions))
    );
