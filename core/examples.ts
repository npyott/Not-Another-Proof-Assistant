import { typeCheck } from "./types.ts";
import { makeAbstraction, apply } from "./utilities.ts";

import {
    ApplyOrLeft,
    ApplyOrRight,
    ConcludeFromOr,
    Or,
    OrFormationLeft,
    OrFormationRight,
    Prop,
    PropDeclarations,
    forAllPropositions,
    implication,
    usePropAxioms,
} from "./prop.ts";

/**
 * Thm 1: (P or Q) => (Q or P)
 * Pf: Let P and Q be propositions
 * Assume h1: P or Q.
 * Note that we have h2: P => Q or P.
 * Hence we deduce h4: (Q or P) or Q from h1 and h2.
 * Likewise, we have h3: Q => Q or P.
 * Hence we deduce h5: (Q or P) or (Q or P) from h1 and h3.
 * This finally implies Q or P by h5.
 */

console.log(
    typeCheck(
        {
            expressionType: "application",
            function: makeAbstraction(
                [
                    Symbol("Theorem 1"),
                    forAllPropositions((P, Q) =>
                        implication(Or(P, Q), Or(Q, P))
                    ),
                ],
                (_thm1) => Prop
            ),
            arguments: [
                forAllPropositions((P, Q) =>
                    makeAbstraction([Symbol("h1"), Or(P, Q)], (h1) =>
                        usePropAxioms(
                            [
                                {
                                    name: OrFormationRight,
                                    reductions: [Q, P],
                                },
                                {
                                    name: OrFormationLeft,
                                    reductions: [Q, P],
                                },
                                {
                                    name: ApplyOrLeft,
                                    reductions: [P, Q, Or(Q, P)],
                                },
                                {
                                    name: ApplyOrRight,
                                    reductions: [Or(Q, P), Q, Or(Q, P)],
                                },
                                {
                                    name: ConcludeFromOr,
                                    reductions: [Or(Q, P)],
                                },
                            ],
                            /**
                             * @param h2 P => Or(Q, P)
                             * @param h3 Q => Or(Q, P)
                             * @param h4 (Or(P, Q), (P => Or(Q, P))) => Or(Or(Q, P), Q)
                             * @param h5 (Or(Or(Q, P), Q), (Q => Or(Q, P))) => Or(Or(Q, P), Or(Q, P))
                             * @param h6 Or(Or(Q, P), Or(Q, P)) => Or(Q, P)
                             */
                            (h2, h3, h4, h5, h6) =>
                                apply(h6, apply(h5, apply(h4, h1, h2), h3))
                        )
                    )
                ),
            ],
        },
        PropDeclarations
    )
);

// apply(
//     ConcludeFromOr,
//     apply(
//         apply(ApplyOrLeft, P, Q, Or(Q, P)),
//         h1,
//         apply(OrFormationRight, Q, P)
//     ),
//     apply(
//         apply(ApplyOrRight, P, Q, Or(Q, P)),
//         h1,
//         apply(OrFormationLeft, Q, P)
//     )
// )
