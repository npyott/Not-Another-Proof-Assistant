type Expression = symbol | AbstractionExpression | ApplicationExpression;

type Declaration = {
    name: symbol;
    type: Expression;
};

type AbstractionExpression = {
    expressionType: "abstraction";
    variables: Declaration[];
    body: Expression;
};

type ApplicationExpression = {
    expressionType: "application";
    function: Expression;
    arguments: Expression[];
};

const isSymbolExpression = (expression: Expression): expression is symbol =>
    typeof expression === "symbol";

const isAbstractionExpression = (
    expression: Expression
): expression is AbstractionExpression =>
    !isSymbolExpression(expression) &&
    expression.expressionType === "abstraction";

const isApplicationExpression = (
    expression: Expression
): expression is ApplicationExpression =>
    !isSymbolExpression(expression) &&
    expression.expressionType === "application";

const alphaReduce = (
    expression: Expression,
    oldSymbol: symbol,
    newSymbol: symbol
): Expression => {
    if (isSymbolExpression(expression)) {
        return expression === oldSymbol ? newSymbol : expression;
    }

    if (isAbstractionExpression(expression)) {
        return {
            expressionType: "abstraction",
            variables: expression.variables.map(({ name, type }) => ({
                name: alphaReduce(name, oldSymbol, newSymbol) as symbol,
                type: alphaReduce(type, oldSymbol, newSymbol),
            })),
            body: alphaReduce(expression.body, oldSymbol, newSymbol),
        };
    }

    return {
        expressionType: "application",
        function: alphaReduce(expression.function, oldSymbol, newSymbol),
        arguments: expression.arguments.map((arg) =>
            alphaReduce(arg, oldSymbol, newSymbol)
        ),
    };
};

const betaReduce = (
    expression: Expression,
    name: symbol,
    value: Expression
): Expression => {
    if (isSymbolExpression(expression)) {
        return expression === name ? value : expression;
    }

    if (isAbstractionExpression(expression)) {
        if (
            expression.variables.length === 0 ||
            (expression.variables.length === 1 &&
                expression.variables[0].name === name)
        ) {
            return betaReduce(expression.body, name, value);
        }

        return {
            expressionType: "abstraction",
            variables: expression.variables
                .filter((variable) => variable.name !== name)
                .map(({ name, type }) => ({
                    name,
                    type: betaReduce(type, name, value),
                })),
            body: betaReduce(expression.body, name, expression),
        };
    }

    return {
        expressionType: "application",
        function: betaReduce(expression.function, name, value),
        arguments: expression.arguments.map((arg) =>
            betaReduce(arg, name, value)
        ),
    };
};

const expressionCongruent = (
    expression1: Expression,
    expression2: Expression
): boolean => {
    if (isSymbolExpression(expression1) && isSymbolExpression(expression2)) {
        return expression1 === expression2;
    }

    if (
        isAbstractionExpression(expression1) &&
        isAbstractionExpression(expression2)
    ) {
        if (expression1.variables.length !== expression2.variables.length) {
            return false;
        }

        if (
            !expression1.variables.every(({ type: type1 }, index) => {
                const type2 = expression2.variables[index].type;
                return expressionCongruent(type1, type2);
            })
        ) {
            return false;
        }

        const renames = expression1.variables.map(
            ({ name: newSymbol }, index) => ({
                oldSymbol: expression2.variables[index].name,
                newSymbol,
            })
        );

        const newBody2 = renames.reduce(
            (body, { oldSymbol, newSymbol }): Expression =>
                alphaReduce(body, oldSymbol, newSymbol),
            expression2.body
        );

        return expressionCongruent(expression1.body, newBody2);
    }

    if (
        isApplicationExpression(expression1) &&
        isApplicationExpression(expression2)
    ) {
        if (expression1.arguments.length !== expression2.arguments.length) {
            return false;
        }

        return (
            expressionCongruent(expression1.function, expression2.function) &&
            expression1.arguments.every((arg1, index) => {
                const arg2 = expression2.arguments[index];

                return expressionCongruent(arg1, arg2);
            })
        );
    }

    return false;
};

// TODO: Use sub-errors to make descriptive chain
const typeCheck = (
    expression: Expression,
    declarations: Declaration[]
): Expression => {
    if (isSymbolExpression(expression)) {
        const declaration = declarations.find(
            ({ name }) => name === expression
        );

        if (!declaration) {
            throw new Error(
                "Undeclared symbol found: " + expression.toString()
            );
        }

        return declaration.type;
    }

    if (isAbstractionExpression(expression)) {
        const existingNames = new Set(declarations.map(({ name }) => name));

        const newDeclarations = declarations.concat(
            ...expression.variables.map((declaration) => {
                if (existingNames.has(declaration.name)) {
                    throw new Error(
                        "Duplicate name found: " + declaration.name.toString()
                    );
                }

                return declaration;
            })
        );

        return {
            expressionType: "abstraction",
            variables: expression.variables.slice(),
            body: typeCheck(expression.body, newDeclarations),
        } as AbstractionExpression;
    }

    const functionType = typeCheck(expression.function, declarations);

    if (!isAbstractionExpression(functionType)) {
        throw new Error("Cannot apply non-function type");
    }

    for (const [index, declaration] of functionType.variables.entries()) {
        const argument = expression.arguments[index];

        if (
            !expressionCongruent(
                typeCheck(argument, declarations),
                declaration.type
            )
        ) {
            throw new Error("Type mismatch on application.");
        }
    }

    const betaReducedExpression = expression.arguments.reduce(
        (functionExpression, argument, index) => {
            const declaration = functionType.variables[index];

            return betaReduce(functionExpression, declaration.name, argument);
        },
        functionType
    );

    return betaReducedExpression;
};