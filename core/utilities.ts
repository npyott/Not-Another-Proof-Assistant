const makeAbstractionSingle = (
    [name, type]: [symbol, Expression],
    body: (symbol: symbol) => Expression
): AbstractionExpression => {
    if (body.length !== 1) {
        throw new Error(`Found 1 variable but ${body.length} parameters.`);
    }

    return {
        expressionType: "abstraction",
        variables: [{ name, type }],
        body: body(name),
    };
};

const makeAbstractionMultiple = (
    variables: [symbol, Expression][],
    body: (...symbols: symbol[]) => Expression
): AbstractionExpression => {
    if (variables.length !== body.length) {
        throw new Error(
            `Found ${variables.length} variables but ${body.length} parameters.`
        );
    }
    return {
        expressionType: "abstraction",
        variables: variables.map(([name, type]) => ({ name, type })),
        body: body(...variables.map(([name]) => name)),
    };
};

export const makeAbstraction = (
    variables: [symbol, Expression] | [symbol, Expression][],
    body: (...symbols: symbol[]) => Expression
): AbstractionExpression =>
    Array.isArray(variables[0])
        ? makeAbstractionMultiple(variables as [symbol, Expression][], body)
        : makeAbstractionSingle(variables as [symbol, Expression], body);

export const independentFunctionType = (
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

// TODO use type check to give intelligent errors
export const apply = (
    func: Expression,
    ...args: Expression[]
): ApplicationExpression => ({
    expressionType: "application",
    function: func,
    arguments: args,
});
