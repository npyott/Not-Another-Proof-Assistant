const Universe = Symbol("Universe");

const Nat = Symbol("Nat");
const Zero = Symbol("0");
const succ = Symbol("succ");

const Prop = Symbol("Prop");
const refl = Symbol("refl");
const equal = Symbol("=");

const makeAbstraction = (
    variables: [symbol, Expression][],
    body: (...symbols: symbol[]) => Expression
): AbstractionExpression => ({
    expressionType: "abstraction",
    variables: variables.map(([name, type]) => ({ name, type })),
    body: body(...variables.map(([name]) => name)),
});

const simpleFunctionType = (
    inputTypes: Expression | Expression[],
    outputType: Expression
): AbstractionExpression => ({
    expressionType: "abstraction",
    variables: Array.isArray(inputTypes)
        ? inputTypes.map((type, index) => ({
              name: Symbol(`var_${index}`),
              type,
          }))
        : [
              {
                  name: Symbol("var"),
                  type: inputTypes,
              },
          ],
    body: outputType,
});

console.log(
    typeCheck(
        {
            expressionType: "application",
            function: refl,
            arguments: [Zero],
        },
        [
            {
                name: Nat,
                type: Universe,
            },
            {
                name: Zero,
                type: Nat,
            },
            {
                name: succ,
                type: simpleFunctionType(Nat, Nat),
            },
            {
                name: Prop,
                type: Universe,
            },
            {
                name: equal,
                type: simpleFunctionType([Nat, Nat], Prop),
            },
            {
                name: refl,
                type: makeAbstraction([[Symbol("n"), Nat]], (n) => ({
                    expressionType: "application",
                    function: equal,
                    arguments: [n, n],
                })),
            },
        ]
    )
);
