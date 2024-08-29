export type Expression = symbol | AbstractionExpression | ApplicationExpression;

export type Declaration = {
    name: symbol;
    type: Expression;
};

export type AbstractionExpression = {
    expressionType: "abstraction";
    variables: Declaration[];
    body: Expression;
};

export type ApplicationExpression = {
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

export const alphaReduce = (
    expression: Expression,
    ...reductions: { name: symbol; rename: symbol }[]
): Expression => {
    const alphaReduceFixed = (expression: Expression) =>
        alphaReduce(expression, ...reductions);

    if (isSymbolExpression(expression)) {
        return (
            reductions.find(({ name: oldSymbol }) => oldSymbol === expression)
                ?.rename ?? expression
        );
    }

    if (isAbstractionExpression(expression)) {
        return {
            expressionType: "abstraction",
            variables: expression.variables.map(({ name, type }) => ({
                name: alphaReduceFixed(name) as symbol,
                type: alphaReduceFixed(type),
            })),
            body: alphaReduceFixed(expression.body),
        };
    }

    return {
        expressionType: "application",
        function: alphaReduceFixed(expression.function),
        arguments: expression.arguments.map(alphaReduceFixed),
    };
};

export const betaReduce = (
    expression: Expression,
    ...reductions: { name: symbol; value: Expression }[]
): Expression => {
    const fixedBetaReduce = (expression: Expression) =>
        betaReduce(expression, ...reductions);

    if (isSymbolExpression(expression)) {
        return (
            reductions.find(({ name }) => name === expression)?.value ??
            expression
        );
    }

    if (isAbstractionExpression(expression)) {
        const reductionNames = new Set(reductions.map(({ name }) => name));

        if (
            expression.variables.length === 0 ||
            expression.variables.every(({ name }) => reductionNames.has(name))
        ) {
            return fixedBetaReduce(expression.body);
        }

        return {
            expressionType: "abstraction",
            variables: expression.variables
                .filter(({ name }) => !reductionNames.has(name))
                .map(({ name, type }) => ({
                    name,
                    type: fixedBetaReduce(type),
                })),
            body: fixedBetaReduce(expression.body),
        };
    }

    return {
        expressionType: "application",
        function: fixedBetaReduce(expression.function),
        arguments: expression.arguments.map(fixedBetaReduce),
    };
};

export const expressionCongruent = (
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

        const reductions = expression2.variables.map(({ name }, index) => ({
            name,
            rename: expression1.variables[index].name,
        }));

        const reducedBody2 = alphaReduce(expression2.body, ...reductions);

        return expressionCongruent(expression1.body, reducedBody2);
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

const typeChain = (
    expression: Expression,
    declarations: Declaration[]
): Expression[] => {
    const expressionType = typeCheck(expression, declarations);

    if (expressionType === Type) {
        return [expression, Type];
    }

    return [expression, ...typeChain(expressionType, declarations)];
};

// TODO: Use sub-errors to make descriptive chain
export const typeCheck = (
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
        const newDeclarations = [...declarations];

        for (const declaration of expression.variables) {
            if (existingNames.has(declaration.name)) {
                throw new Error(
                    "Duplicate name found: " + declaration.name.toString()
                );
            }

            // Declarations should be valid types as well
            if (declaration.type !== Type) {
                typeCheck(declaration.type, newDeclarations);
            }

            newDeclarations.push(declaration);
        }

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

    const reductions: { name: symbol; value: Expression }[] = [];
    for (const [index, declaration] of functionType.variables.entries()) {
        const argument = expression.arguments[index];

        // Allow direct sub-typing
        // i.e. type literals, anything is of type Type, etc.
        const argTypeChain = typeChain(argument, declarations);
        if (
            !argTypeChain.some((type) =>
                expressionCongruent(type, declaration.type)
            )
        ) {
            throw new Error(`Type mismatch on application.`);
        }

        reductions.push({ name: declaration.name, value: argument });
    }

    return betaReduce(functionType, ...reductions);
};

export const Type = Symbol("Type");
