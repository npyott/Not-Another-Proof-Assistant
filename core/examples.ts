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

// console.log(
//     typeCheck(
//         {
//             expressionType: "application",
//             function: makeAbstraction(
//                 [
//                     Symbol("Theorem 1"),
//                     forAllPropositions((P, Q) =>
//                         implication(Or(P, Q), Or(Q, P))
//                     ),
//                 ],
//                 (_thm1) => Prop
//             ),
//             arguments: [
//                 forAllPropositions((P, Q) =>
//                     makeAbstraction([Symbol("h1"), Or(P, Q)], (h1) =>
//                         apply(
//                             ConcludeFromOr,
//                             apply(
//                                 apply(ApplyOrLeft, P, Q, Or(Q, P)),
//                                 h1,
//                                 apply(OrFormationRight, Q, P)
//                             ),
//                             apply(
//                                 apply(ApplyOrRight, P, Q, Or(Q, P)),
//                                 h1,
//                                 apply(OrFormationLeft, Q, P)
//                             )
//                         )
//                     )
//                 ),
//             ],
//         },
//         PropDeclarations
//     )
// );

const P = Symbol("P");
const Q = Symbol("Q");
const h1 = Symbol("h1");

console.log(
    typeCheck(
        apply(OrFormationRight, Q, P),
        PropDeclarations.concat([
            {
                name: P,
                type: Prop,
            },
            {
                name: Q,
                type: Prop,
            },
            {
                name: h1,
                type: Or(P, Q),
            },
        ])
    )
);
