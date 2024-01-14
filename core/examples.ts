import {
    ApplyOrLeft,
    ApplyOrRight,
    ConcludeFromOr,
    ExcludedMiddle,
    Or,
    OrFormationLeft,
    OrFormationRight,
    PropDeclarations,
    forAllPropositions,
    implication,
} from "./prop";
import { makeAbstraction, apply } from "./utilities";

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
                (_thm1) => Symbol("Done :)")
            ),
            arguments: [
                forAllPropositions((P, Q) =>
                    makeAbstraction([Symbol("h1"), Or(P, Q)], (h1) =>
                        apply(
                            ConcludeFromOr,
                            apply(
                                apply(ApplyOrLeft, P, Q, Or(Q, P)),
                                h1,
                                apply(OrFormationRight, Q, P)
                            ),
                            apply(
                                apply(ApplyOrRight, P, Q, Or(Q, P)),
                                h1,
                                apply(OrFormationLeft, Q, P)
                            )
                        )
                    )
                ),
            ],
        },
        PropDeclarations
    )
);
