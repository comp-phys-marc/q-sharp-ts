import * as fs from 'fs';
import Lexer from './lexer.js';
import { inverseTypeLookup, notParam, Token } from './token.js';
import { Id, Arr, Int, Bool, Mod, Parameter, Condition, Minus, Plus, Times, Divide, Exp, Str, Geq, Leq, Neq, Expression, Qubit, Or, Less, More, And, Not, Left, Right, Variable, Let, Range, Struct, Operation, Function, BigInt, Result, Double, Pauli, Eq, Peq, Meq, Dummy, BitwiseAnd, BitwiseNot, BitwiseOr, BitwiseXor, Use, Borrow, Import, Mutable, Unwrap, For, While, Repeat, Fail, Return, Conjugation, Paulis, Modifier, GetParam, ArrayType, Comment, CCNOT, CNOT, Ex, H, I, M, R1, R1Frac, Reset, ResetAll, RFrac, Rx, Rxx, Ry, Ryy, Rz, Rzz, S, SWAP, T, X, Y, Z, UnitType, BigIntType, IntType, DoubleType, BoolType, StringType, QubitType, ResultType, PauliType, RangeType, TupleType, OperationType, FunctionType, ApplyOperator, Continue, CZ, Adjoint, Controlled, } from './ast.js';
import { BadImportError, BadFunctionNameError, BadConjugationError, BadOperationNameError, BadIntError, BadIteratorError, BadLoopError, BadConditionStructureError, BadBindingError, BadIdentifierError, BadStructError, BadIndexError, BadUseError, UninitializedVariableError, BadApplicationError, BadParameterError, BadArgumentError } from './errors.js';
import { ComplexMatrix, parseComplex } from './complex.js';
/** Class representing a token parser. */
class Parser {
    /**
     * Creates a parser.
     * @param tokens - Tokens to parse.
     */
    constructor(tokens, isSubContext = false, filePath = '') {
        this.tokens = tokens;
        this.libraries = [];
        this.symbols = [];
        this.qubits = [];
        this.variables = [];
        this.variableTypes = [];
        this.parameters = [];
        this.instances = {};
        this.clauseParsers = [];
        this.funcParsers = {};
        this.operationParsers = {};
        this.structParsers = [];
        this.isSubContext = isSubContext;
        this.filePath = filePath;
    }
    /**
     * Updates the cursor after aprsing one clause.
     * @param i - The old cursor position.
     * @returns The new cursor position.
     */
    traverseClause(i) {
        let openBrackets = -1;
        while ((!(this.tokens[i] == undefined) && !(this.matchNext(this.tokens.slice(i), [Token.EndOfFile])) && !(this.matchNext(this.tokens.slice(i), [Token.Rcurlbrac]))) || (openBrackets > 0)) {
            if (this.matchNext(this.tokens.slice(i), [Token.Lcurlbrac])) {
                openBrackets += 1;
            }
            else if (this.matchNext(this.tokens.slice(i), [Token.Rcurlbrac]) && openBrackets > 0) {
                openBrackets -= 1;
            }
            i++;
        }
        return i;
    }
    /**
     * Figures out the new cursor position based on what has been parsed.
     * @param i - The current cursor position.
     * @returns The new cursor position.
     */
    updateCursor(i) {
        if (this.tokens[i][0] == Token.Function || this.tokens[i][0] == Token.Operation) {
            i = this.traverseClause(i);
        }
        else if (this.tokens[i][0] == Token.Within) {
            i = this.traverseClause(i);
            i++;
            if (this.matchNext(this.tokens.slice(i), [Token.Apply])) {
                i++;
                i = this.traverseClause(i);
            }
        }
        else if (this.tokens[i][0] == Token.If) {
            i = this.traverseClause(i);
            i++;
            if (this.matchNext(this.tokens.slice(i), [Token.Else])) {
                i++;
                i = this.traverseClause(i);
            }
            // TODO: Repeat
        }
        else if ((this.tokens[i][0] == Token.For) || (this.tokens[i][0] == Token.While)) {
            i = this.traverseClause(i);
        }
        else if (this.tokens[i][0] == Token.Adjoint) {
            // NOP
        }
        else {
            while (!(this.tokens[i] == undefined) && !(this.matchNext(this.tokens.slice(i), [Token.EndOfFile])) && !(this.matchNext(this.tokens.slice(i), [Token.Newline]))) {
                i++;
            }
        }
        i++;
        return i;
    }
    /**
     * Calling this method parses the code represented by the provided tokens.
     * @return The abstract syntax tree.
     */
    parse() {
        let ast = [];
        let i = 0;
        while (i < (this.tokens.length - 1)) {
            let nodes = this.parseNode(this.tokens.slice(i));
            ast = ast.concat(nodes ? nodes : []);
            i = this.updateCursor(i);
        }
        return ast;
    }
    /**
     * Delegates the parsing of the next set of tokens to the appropriate method.
     * @param tokens - Remaining tokens to parse.
     * @param allowVariables - Whether encountered identifiers should be consider variable initializations or references.
     * @return A set of AST nodes.
     */
    parseNode(tokens, allowVariables = true) {
        const token = tokens[0];
        switch (token[0]) {
            // TODO: cases for AstTypes
            case Token.UnitType:
                return [new UnitType()];
            case Token.IntType:
                return [new IntType()];
            case Token.BigIntType:
                return [new BigIntType()];
            case Token.DoubleType:
                return [new DoubleType()];
            case Token.BoolType:
                return [new BoolType()];
            case Token.StringType:
                return [new StringType()];
            case Token.QubitType:
                return [new QubitType()];
            case Token.ResultType:
                return [new ResultType()];
            case Token.PauliType:
                return [new PauliType()];
            case Token.RangeType:
                return [new RangeType()];
            case Token.ArrayType:
                return [new ArrayType()];
            case Token.TupleType:
                return [new TupleType()];
            case Token.StructType:
                return [new StringType()];
            case Token.OperationType:
                return [new OperationType()];
            case Token.FunctionType:
                return [new FunctionType()];
            case Token.AND:
                return [new And()];
            case Token.CCNOT:
                return this.twoQubitGate(tokens.slice(1), CCNOT);
            case Token.CNOT:
                return this.twoQubitGate(tokens.slice(1), CNOT);
            case Token.Ex:
                return [new Ex()];
            case Token.H:
                return this.singleQubitGate(tokens.slice(1), H);
            case Token.I:
                return this.singleQubitGate(tokens.slice(1), I);
            case Token.M:
                return this.singleQubitGate(tokens.slice(1), M);
            case Token.Measure:
                return this.singleQubitGate(tokens.slice(1), M); // check this!
            case Token.R:
                return this.singleRotationGate(tokens.slice(1), H);
            case Token.R1:
                return this.singleRotationGate(tokens.slice(1), R1);
            case Token.R1Frac:
                return this.singleRotationGate(tokens.slice(1), R1Frac);
            case Token.Reset:
                return this.singleQubitGate(tokens.slice(1), Reset);
            case Token.ResetAll:
                return this.singleQubitGate(tokens.slice(1), ResetAll);
            case Token.RFrac:
                return this.singleRotationGate(tokens.slice(1), RFrac);
            case Token.Rx:
                return this.singleRotationGate(tokens.slice(1), Rx);
            case Token.Rxx:
                return this.isingRotationGate(tokens.slice(1), Rxx);
            case Token.Ry:
                return this.singleRotationGate(tokens.slice(1), Ry);
            case Token.Ryy:
                return this.isingRotationGate(tokens.slice(1), Ryy);
            case Token.Rz:
                return this.singleRotationGate(tokens.slice(1), Rz);
            case Token.Rzz:
                return this.isingRotationGate(tokens.slice(1), Rzz);
            case Token.S:
                return this.singleQubitGate(tokens.slice(1), S);
            case Token.SWAP:
                return this.twoQubitGate(tokens.slice(1), SWAP);
            case Token.T:
                return this.singleQubitGate(tokens.slice(1), T);
            case Token.X:
                return this.singleQubitGate(tokens.slice(1), X);
            case Token.Y:
                return this.singleQubitGate(tokens.slice(1), Y);
            case Token.Z:
                return this.singleQubitGate(tokens.slice(1), Z);
            case Token.ApplyUnitary:
                return this.unitary(tokens.slice(1));
            case Token.True:
                return [new Bool(true)];
            case Token.False:
                return [new Bool(false)];
            case Token.Zero:
                return [new Result(false)];
            case Token.One:
                return [new Result(true)];
            case Token.PauliX:
                return [new Pauli(Paulis.PauliX)];
            case Token.PauliY:
                return [new Pauli(Paulis.PauliY)];
            case Token.PauliZ:
                return [new Pauli(Paulis.PauliZ)];
            case Token.Let:
                return this.let(tokens);
            case Token.Mutable:
                return this.mutable(tokens);
            case Token.If:
                return this.if(tokens);
            case Token.For:
                return this.for(tokens.slice(1));
            case Token.While:
                return this.while(tokens.slice(1));
            case Token.Repeat:
                return this.repeat(tokens.slice(1));
            case Token.Return:
                return this.return(tokens);
            case Token.Fail:
                return this.fail(tokens.slice(1));
            case Token.Identifier:
                return this.identifier(tokens, allowVariables);
            case Token.Function:
                return this.function(tokens.slice(1));
            case Token.Use:
                return this.use(tokens.slice(1));
            case Token.Operation:
                return this.operation(tokens.slice(1));
            case Token.Lsqbrac:
                return this.array(tokens.slice(1));
            case Token.StructType:
                return this.struct(tokens.slice(2), tokens[1][1]);
            case Token.Import:
                return this.import(tokens.slice(1));
            case Token.Int:
                return [new Int(Number(tokens[0][1]))];
            case Token.BigInt:
                return [new BigInt(Number(tokens[0][1]))];
            case Token.Double:
                return [new Double(Number(tokens[0][1]))];
            case Token.Or:
                return [new Or()];
            case Token.And:
                return [new And()];
            case Token.And:
                return [new Not()];
            case Token.Less:
                return [new Less()];
            case Token.More:
                return [new More()];
            case Token.Left:
                return [new Left()];
            case Token.Right:
                return [new Right()];
            case Token.Unwrap:
                return [new Unwrap()];
            case Token.BitwiseAnd:
                return [new BitwiseAnd()];
            case Token.BitwiseOr:
                return [new BitwiseOr()];
            case Token.BitwiseNot:
                return [new BitwiseNot()];
            case Token.BitwiseXor:
                return [new BitwiseXor()];
            case Token.Mod:
                return [new Mod()];
            case Token.Dummy:
                return [new Dummy()];
            case Token.Exp:
                return [new Exp()];
            case Token.Eq:
                return [new Eq()];
            case Token.Neq:
                return [new Neq()];
            case Token.Divide:
                return [new Divide()];
            case Token.Eq:
                return [new Eq()];
            case Token.Leq:
                return [new Leq()];
            case Token.Geq:
                return [new Geq()];
            case Token.Neq:
                return [new Neq()];
            case Token.Peq:
                return [new Peq()];
            case Token.Meq:
                return [new Meq()];
            case Token.Times:
                return [new Times()];
            case Token.Plus:
                return [new Plus()];
            case Token.Minus:
                return [new Minus()];
            case Token.String:
                return [new Str(token[1])];
            case Token.Within:
                return this.conjugation(tokens.slice(0));
            case Token.Comment:
                return [new Comment(token[1].toString())];
            case Token.Controlled:
                if (tokens[1][0] == Token.X) {
                    return this.twoQubitGate(tokens.slice(2), CNOT); // TODO: support other controlled gates
                }
                else if (tokens[1][0] == Token.Z) {
                    return this.twoQubitGate(tokens.slice(2), CZ);
                }
                else {
                    return this.modifiers(tokens);
                }
            case Token.Adjoint:
                return this.modifiers(tokens);
        }
    }
    /**
     * Parses a single qubit gate application.
     * @param tokens - Tokens to parse.
     * @return A parsed gate application.
     */
    singleQubitGate(tokens, gateClass) {
        let qubit;
        let consumed;
        if (this.matchNext(tokens, [Token.Lbrac, Token.Identifier])) {
            tokens = tokens.slice(1);
            [qubit, consumed] = this.parseSymbol(tokens);
        }
        else {
            throw BadApplicationError;
        }
        return [new gateClass(qubit)];
    }
    /**
     * Parses a two qubit gate application.
     * @param tokens - Tokens to parse.
     * @return A parsed gate application.
     */
    twoQubitGate(tokens, gateClass) {
        let qubit;
        let secondQubit;
        let consumed;
        if (this.matchNext(tokens, [Token.Lbrac, Token.Identifier])) {
            tokens = tokens.slice(1);
            [qubit, consumed] = this.parseSymbol(tokens);
            tokens = tokens.slice(consumed);
            if (this.matchNext(tokens, [Token.Comma, Token.Identifier])) {
                tokens = tokens.slice(1);
                [secondQubit, consumed] = this.parseSymbol(tokens);
            }
            else {
                throw BadApplicationError;
            }
        }
        return [new gateClass(qubit, secondQubit)];
    }
    /**
     * Parses a single qubit rotation.
     * @param tokens - Tokens to parse.
     * @return A parsed gate application.
     */
    singleRotationGate(tokens, gateClass) {
        let qubit;
        let rads;
        let consumed;
        if (this.matchNext(tokens, [Token.Lbrac, Token.Double])) {
            tokens = tokens.slice(1);
            rads = new Double(tokens[0][1]);
            tokens = tokens.slice(1);
            if (this.matchNext(tokens, [Token.Comma, Token.Identifier])) {
                tokens = tokens.slice(1);
                [qubit, consumed] = this.parseSymbol(tokens);
            }
            else {
                throw BadApplicationError;
            }
        }
        return [new gateClass(rads, qubit)];
    }
    /**
     * Parses an arbitrary unitary.
     * @param tokens - Tokens to parse.
     * @return A parsed unitary application.
     */
    unitary(tokens) {
        let row = [];
        while (!(this.matchNext(tokens, [Token.Rsqbrac]))) {
            if (!(this.matchNext(tokens, [Token.Lsqbrac]))) {
                let complex = parseComplex(tokens[1].toString());
                row.push(complex);
                while (!(this.matchNext(tokens, [Token.Comma])) && !(this.matchNext(tokens, [Token.Rsqbrac]))) {
                    tokens = tokens.slice(1);
                }
            }
            else {
                row.push(this.unitary(tokens.slice(1)));
            }
        }
        return [new ComplexMatrix(row)];
    }
    /**
     * Parses an two qubit rotation.
     * @param tokens - Tokens to parse.
     * @return A parsed gate application.
     */
    isingRotationGate(tokens, gateClass) {
        let qubit;
        let rads;
        let secondQubit;
        let consumed;
        if (this.matchNext(tokens, [Token.Lbrac, Token.Double])) {
            tokens = tokens.slice(1);
            rads = new Double(tokens[0][1]);
            tokens = tokens.slice(1);
            if (this.matchNext(tokens, [Token.Comma, Token.Identifier])) {
                tokens = tokens.slice(1);
                [qubit, consumed] = this.parseSymbol(tokens);
                tokens = tokens.slice(consumed);
                if (this.matchNext(tokens, [Token.Comma, Token.Identifier])) {
                    tokens = tokens.slice(1);
                    [secondQubit, consumed] = this.parseSymbol(tokens);
                    return [new gateClass(rads, qubit, secondQubit)];
                }
                else {
                    throw BadApplicationError;
                }
            }
            else {
                throw BadApplicationError;
            }
        }
    }
    /**
     * Parses a logical and mathematical expression.
     * @param tokens - Expression tokens to parse.
     * @return A parsed expression.
     */
    parseExpression(tokens) {
        let elements = [];
        let nodes;
        let nonParam = false;
        let consumed = 0;
        while (tokens.length > 0 && !nonParam) {
            nodes = this.parseNode(tokens, true);
            if (nodes !== undefined) {
                for (let i in nodes) {
                    if (nodes[i] instanceof Parameter) {
                        elements.push(nodes[i]);
                    }
                    else {
                        nonParam = true;
                        break;
                    }
                }
            }
            else {
                nonParam = true;
            }
            for (let n in nodes) {
                if (nodes[n] instanceof ApplyOperator) {
                    let i = 0;
                    let openBrackets = -1;
                    while ((tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Rbrac]) && !this.matchNext(tokens.slice(i), [Token.EndOfFile])) || (openBrackets > 0)) {
                        if (this.matchNext(tokens.slice(i), [Token.Lbrac])) {
                            openBrackets += 1;
                        }
                        else if (this.matchNext(tokens.slice(i), [Token.Rbrac]) && openBrackets > 0) {
                            openBrackets -= 1;
                        }
                        i++;
                    }
                    tokens = tokens.slice(i + 1);
                    consumed += i + 1;
                }
                else {
                    tokens = tokens.slice(1);
                    consumed += 1;
                }
            }
        }
        return [new Expression(elements), consumed];
    }
    /**
     * Parses a conjugation.
     * @param tokens - Tokens to parse.
     * @return A parsed conjugation.
     */
    conjugation(tokens) {
        let withinTokens = [];
        let applyTokens = [];
        if (this.matchNext(tokens, [Token.Within, Token.Lcurlbrac])) {
            tokens = tokens.slice(1);
            let i = 0;
            let openBrackets = -1;
            while ((tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Rcurlbrac])) || (openBrackets > 0)) {
                if (this.matchNext(tokens.slice(i), [Token.Lcurlbrac])) {
                    openBrackets += 1;
                }
                else if (this.matchNext(tokens.slice(i), [Token.Rcurlbrac]) && openBrackets > 0) {
                    openBrackets -= 1;
                }
                withinTokens.push(tokens[i]);
                i++;
            }
            i++;
            tokens = tokens.slice(i);
            let withinParser = this.childParser(withinTokens);
            let withinCode = withinParser.parse();
            if (this.matchNext(tokens, [Token.Apply, Token.Lcurlbrac])) {
                tokens = tokens.slice(1);
                let j = 0;
                openBrackets = -1;
                while ((tokens[j] != undefined && !this.matchNext(tokens.slice(j), [Token.Rcurlbrac])) || (openBrackets > 0)) {
                    if (this.matchNext(tokens.slice(j), [Token.Lcurlbrac])) {
                        openBrackets += 1;
                    }
                    else if (this.matchNext(tokens.slice(j), [Token.Rcurlbrac]) && openBrackets > 0) {
                        openBrackets -= 1;
                    }
                    applyTokens.push(tokens[j]);
                    j++;
                }
                let applyParser = this.childParser(applyTokens);
                let applyCode = applyParser.parse();
                return [new Conjugation(withinCode, applyCode)];
            }
            else {
                throw BadConjugationError;
            }
        }
    }
    /**
     * Whether a variable is known.
     * @param name - The string name of the variable.
     * @return Whether it corresponds to a variable in this.variables.
     */
    hasVariable(name) {
        let seen = false;
        for (let variable of this.variables) {
            if (variable.name == name) {
                seen = true;
                break;
            }
        }
        return seen;
    }
    /**
     * Whether a qubit is known.
     * @param name - The string name of the qubit.
     * @return Whether it corresponds to a qubit in this.qubits.
     */
    hasQubit(name) {
        let seen = false;
        for (let q of this.qubits) {
            if (q.name == name) {
                seen = true;
                break;
            }
        }
        return seen;
    }
    /**
     * Parses a return.
     * @param tokens - Tokens to parse.
     * @return A parsed return statement.
     */
    return(tokens) {
        return [new Return(this.parseExpression(tokens.slice(1))[0])];
    }
    /**
     * Parses an fail statement.
     * @param tokens - Tokens to parse.
     * @return A parsed fail statement.
     */
    fail(tokens) {
        return [new Fail(new Str(tokens[0]))];
    }
    /**
     * Parses an operation.
     * @param tokens - Tokens to parse.
     * @return A parsed operation.
     */
    operation(tokens) {
        let name;
        let operationTokens = [];
        let operationParams = [];
        let modifierTokens = [];
        if (this.matchNext(tokens, [Token.Identifier, Token.Lbrac])) {
            name = tokens[0][1].toString();
            tokens = tokens.slice(2);
            let i = 0;
            operationParams = this.matchParamList(tokens);
            while (tokens[i] != undefined && !(this.matchNext(tokens.slice(i), [Token.Rbrac]))) {
                i++;
            }
            if (this.matchNext(tokens.slice(i + 1), [Token.Unit, Token.Is])) {
                modifierTokens = this.modifiers(tokens.slice(i + 2)).map((mod) => {
                    if (mod instanceof Adjoint) {
                        return Modifier.Adjoint;
                    }
                    else if (mod instanceof Controlled) {
                        return Modifier.Controlled;
                    }
                });
            }
            let j = i + 2 + modifierTokens.length;
            let ty = new UnitType();
            let k = 0;
            if (inverseTypeLookup(tokens.slice(j)[0][0])) {
                ty = this.parseNode(tokens.slice(j))[0];
                while (tokens[j + k] != undefined && !(this.matchNext(tokens.slice(j + k), [Token.Lcurlbrac]))) {
                    k++;
                }
            }
            j += k + 1;
            let openBrackets = 0;
            while ((tokens[j] != undefined && !this.matchNext(tokens.slice(j), [Token.Rcurlbrac])) || (openBrackets > 0)) {
                if (this.matchNext(tokens.slice(j), [Token.Lcurlbrac])) {
                    openBrackets += 1;
                }
                else if (this.matchNext(tokens.slice(j), [Token.Rcurlbrac]) && openBrackets > 0) {
                    openBrackets -= 1;
                }
                operationTokens.push(tokens[j]);
                j++;
            }
            let operationParser = this.childParser(operationTokens);
            let operationCode = operationParser.parse();
            this.libraries.push(name);
            this.operationParsers[name] = operationParser;
            return [new Operation(name, operationCode, operationParams, modifierTokens, ty)];
        }
        else {
            throw BadOperationNameError;
        }
    }
    /**
     * Parses a list of modifiers.
     * @param tokens - Modifiers to parse.
     * @return Parsed modifiers.
     */
    modifiers(tokens) {
        let modifiers = [];
        let i = 0;
        while (tokens[i] != undefined && (this.matchNext(tokens.slice(i), [Token.Plus]) || this.matchNext(tokens.slice(i), [Token.Adjoint]) || this.matchNext(tokens.slice(i), [Token.Controlled]))) {
            if (this.matchNext(tokens.slice(i), [Token.Adjoint])) {
                modifiers.push(new Adjoint());
            }
            else if (this.matchNext(tokens.slice(i), [Token.Controlled])) {
                modifiers.push(new Controlled());
            }
            i++;
        }
        return modifiers;
    }
    /**
     * Parses a function.
     * @param tokens - Function tokens to parse.
     * @return A parsed function.
     */
    function(tokens) {
        let name;
        let functionTokens = [];
        let functionParams = [];
        if (this.matchNext(tokens, [Token.Identifier, Token.Lbrac])) {
            name = tokens[0][1].toString();
            tokens = tokens.slice(2);
            let i = 0;
            functionParams = this.matchParamList(tokens);
            while (tokens[i] != undefined && !(this.matchNext(tokens.slice(i), [Token.Rbrac]))) {
                i++;
            }
            let ty = new UnitType();
            let k = 0;
            if (inverseTypeLookup(tokens.slice(2)[0][0])) {
                ty = this.parseNode(tokens.slice(2))[0];
                while (tokens[2 + k] != undefined && !(this.matchNext(tokens.slice(2 + k), [Token.Lcurlbrac]))) {
                    k++;
                }
            }
            let j = 2 + k;
            let openBrackets = -1;
            while ((tokens[j] != undefined && !this.matchNext(tokens.slice(j), [Token.Rcurlbrac])) || (openBrackets > 0)) {
                if (this.matchNext(tokens.slice(j), [Token.Lcurlbrac])) {
                    openBrackets += 1;
                }
                else if (this.matchNext(tokens.slice(j), [Token.Rcurlbrac]) && openBrackets > 0) {
                    openBrackets -= 1;
                }
                functionTokens.push(tokens[j]);
                j++;
            }
            let functionParser = this.childParser(functionTokens);
            let functionCode = functionParser.parse();
            this.libraries.push(name);
            this.funcParsers[name] = functionParser;
            return [new Function(name, functionCode, functionParams, ty)];
        }
        else {
            throw BadFunctionNameError;
        }
    }
    /**
 * Parses an Identifier or Ancilliary symbol.
 * @param tokens - Symbol tokens to parse.
 * @return A parsed symbol.
 */
    parseSymbol(tokens) {
        let name;
        let consumed = 0;
        if (this.matchNext(tokens, [Token.Identifier])) {
            name = tokens[0][1].toString();
        }
        tokens = tokens.slice(1);
        consumed += 1;
        if (this.matchNext(tokens, [Token.Lsqbrac])) {
            tokens = tokens.slice(1);
            consumed += 1;
            if (this.matchNext(tokens, [Token.Identifier, Token.Rsqbrac])) {
                let index = new Variable(tokens[0][1].toString());
                if (this.hasVariable(tokens[0][1].toString())) {
                    return [new GetParam(name, new Expression([index])), consumed];
                }
                else {
                    throw BadIndexError;
                }
            }
            else if (this.matchNext(tokens, [Token.Int, Token.Rsqbrac])) {
                let index = new Int(tokens[0][1]);
                tokens = tokens.slice(1);
                return [new GetParam(name, new Expression([index])), 4];
            }
            else {
                let [expr, exprConsumed] = this.parseExpression(tokens);
                if (this.matchNext(tokens.slice(exprConsumed), [Token.Rsqbrac])) {
                    return [new GetParam(name, expr), consumed];
                }
                else {
                    let [range, rngConsumed] = this.range(tokens);
                    return [new GetParam(name, range), consumed + rngConsumed];
                }
            }
        }
        else if (this.matchNext(tokens, [Token.Period, Token.Identifier])) {
            let inst = name;
            return [new GetParam(inst, new Expression([this.parseSymbol(tokens.slice(1))[0]])), 3];
        }
        else if (this.hasQubit(name)) {
            return [new Qubit(name), 1];
        }
        else if (this.hasVariable(name)) {
            return [new Variable(name), 1];
        }
        else {
            return [new Id(name), 1];
        }
    }
    /**
     * Parses and identifier.
     * @param tokens - Tokens to parse.
     * @return A parsed identifier.
     */
    identifier(tokens, allowVariables) {
        if (!allowVariables) {
            this.symbols.push(tokens[0][1].toString());
            return [this.parseSymbol(tokens)[0]];
        }
        else if (allowVariables) {
            if ((tokens.length > 1) && (tokens[1][0] == Token.Lbrac) && (this.libraries.length > 0)) { // TODO: build a robust import system
                return [this.application(tokens)];
            }
            if (this.symbols.includes(tokens[0][1].toString()) || this.libraries.length > 0) { // TODO: build a robust import system
                return [this.parseSymbol(tokens)[0]];
            }
        }
        throw BadIdentifierError;
    }
    /**
     * Parses the application of a non-intrinsic operator or function.
     * @param tokens - Tokens to parse.
     * @return A parsed operator or function application.
     */
    /**
 * Parses an application of one of hte allowed operators.
 * @param tokens - Remaining tokens to parse.
 * @return An AST node representing the operator application.
 */
    application(tokens) {
        let name;
        let registers;
        let params;
        if (this.matchNext(tokens, [Token.Identifier, Token.Lbrac])) {
            name = tokens[0][1].toString();
            tokens = tokens.slice(2);
            params = this.matchParamList(tokens);
        }
        else {
            throw BadApplicationError;
        }
        let j = 0;
        let openBrackets = -1;
        while ((tokens[j] != undefined && !this.matchNext(tokens.slice(j), [Token.Rbrac])) || (openBrackets > 0)) {
            if (this.matchNext(tokens.slice(j), [Token.Lbrac])) {
                openBrackets += 1;
            }
            else if (this.matchNext(tokens.slice(j), [Token.Rbrac]) && openBrackets > 0) {
                openBrackets -= 1;
            }
            j++;
        }
        tokens = tokens.slice(j);
        if (this.matchNext(tokens, [Token.Lbrac])) {
            tokens = tokens.slice(1);
            registers = this.matchIndexList(tokens);
        }
        return new ApplyOperator(name, params, registers);
    }
    /**
     * Parses a list of registers.
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the registers.
     */
    matchIndexList(tokens) {
        let args = [];
        let next;
        let id;
        let j = 0;
        while (j < tokens.length && !this.matchNext(tokens.slice(j), [Token.Newline]) && !this.matchNext(tokens.slice(j), [Token.Rbrac])) {
            id = tokens[j][1].toString();
            let index = this.matchIndex(tokens.slice(j + 1));
            next = new Qubit(id, new Int(1));
            args.push(next);
            if (index != undefined) {
                j += 4;
            }
            else {
                j++;
            }
            if (this.matchNext(tokens.slice(j), [Token.Comma])) {
                j++;
            }
        }
        return args;
    }
    /**
     * Parses a register index.
     * @param tokens - Tokens to parse.
     * @return The index’s value.
     */
    matchIndex(tokens) {
        let index;
        if (this.matchNext(tokens, [Token.Lsqbrac])) {
            tokens = tokens.slice(1);
            if (this.matchNext(tokens, [Token.Int])) {
                index = Number(tokens[0][1]);
                tokens = tokens.slice(1);
            }
            else {
                throw BadArgumentError;
            }
            if (this.matchNext(tokens, [Token.Rsqbrac])) {
                return index;
            }
            else {
                throw BadArgumentError;
            }
        }
    }
    /**
     * Parses a list of parameter values.
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the parameter values.
     */
    matchParamList(tokens) {
        let args = [];
        let i = 0;
        let j = 0;
        let openBrackets = 0;
        args[0] = [];
        while (tokens[j] != undefined && (openBrackets == 0 &&
            !this.matchNext(tokens.slice(j), [Token.Rbrac]))) {
            while (!this.matchNext(tokens.slice(j), [Token.Comma]) && tokens[j] !=
                undefined && !this.matchNext(tokens.slice(j), [Token.Rbrac])) {
                if (this.matchNext(tokens.slice(j), [Token.Lbrac])) {
                    openBrackets += 1;
                    j++;
                }
                if (notParam(tokens[j][0])) {
                    throw BadParameterError;
                }
                let next = this.parseExpression(tokens.slice(j))[0];
                if (next != undefined) {
                    args[i].push(next);
                }
                while (!(this.matchNext(tokens.slice(j), [Token.Rbrac])) && !this.matchNext(tokens.slice(j), [Token.Comma])) {
                    j++;
                }
            }
            if (this.matchNext(tokens.slice(j), [Token.Rbrac])) {
                if (openBrackets != 0) {
                    openBrackets -= 1;
                }
                else {
                    break;
                }
            }
            i++;
            j++;
            args[i] = [];
        }
        return args.filter((elem) => (elem.length > 0));
    }
    /**
     * Parses a parameter value.
     * @param tokens - Tokens to parse.
     * @return An AST node representing the parameter value.
     */
    matchParam(tokens) {
        let param;
        let paramTokens = [];
        if (!(notParam(tokens[0][0]))) {
            let i = 0;
            while (tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Newline]) && !this.matchNext(tokens.slice(i), [Token.Rbrac])
                && !this.matchNext(tokens.slice(i), [Token.Comma])) {
                paramTokens.push(tokens[i]);
                i++;
            }
            param = this.parseNode(paramTokens, true)[0];
        }
        else {
            throw BadParameterError;
        }
        return param;
    }
    /**
     * Parses a struct.
     * @param tokens - Tokens to parse.
     * @return A parsed struct.
     */
    struct(tokens, name) {
        let names = [];
        let vals = [];
        let [id, consumed] = ['', 0];
        while (!(this.matchNext(tokens, [Token.Rcurlbrac]))) {
            if (this.matchNext(tokens, [Token.Identifier, Token.Colon])) {
                if (Object.keys(this.structParsers).includes(name)) {
                    [id, consumed] = this.structParsers[name].parseSymbol(tokens);
                    tokens = tokens.slice(consumed);
                }
                else {
                    this.structParsers[name] = new StructParser(tokens);
                    [id, consumed] = this.structParsers[name].parseSymbol(tokens);
                    tokens = tokens.slice(consumed);
                }
                let val = this.parseNode(tokens.slice(1));
                names.push(new Id(id));
                vals.push(val);
                tokens = tokens.slice(1);
                if (this.matchNext(tokens, [Token.Comma])) {
                    tokens = tokens.slice(1);
                }
            }
            else {
                throw BadStructError;
            }
        }
        return [new Struct(vals, names)];
    }
    /**
     * Parses an array.
     * @param tokens - Tokens to parse.
     * @return A parsed array.
     */
    array(tokens) {
        let vals = [];
        while (!(this.matchNext(tokens, [Token.Rsqbrac]))) { // TODO: support arbitrary expressions
            let [param, consumed] = this.parseExpression(tokens);
            vals.push(param);
            while (!(this.matchNext(tokens, [Token.Comma])) && !(this.matchNext(tokens, [Token.Rsqbrac]))) {
                tokens = tokens.slice(consumed);
            }
            if (this.matchNext(tokens, [Token.Comma])) {
                tokens = tokens.slice(1);
            }
        }
        return [new Arr(vals, vals.length)];
    }
    /**
     * Parses qubit usage.
     * @param tokens - Qubit usage tokens to parse.
     * @return A parsed qubit usage.
     */
    use(tokens) {
        // use qubit = Qubit(); style
        if (this.matchNext(tokens, [Token.Identifier, Token.Eq])) {
            const id = this.identifier(tokens, false)[0];
            if (id instanceof Id) {
                const qubit = new Qubit(id.id);
                tokens = tokens.slice(2);
                if (this.matchNext(tokens, [Token.QubitType, Token.Lbrac, Token.Rbrac])) {
                    this.qubits.push(qubit);
                    return [new Use(new Str(id.id), qubit)];
                }
                else if (this.matchNext(tokens, [Token.QubitType, Token.Lsqbrac])) {
                    tokens = tokens.slice(2);
                    let size = this.matchParam([tokens[0]]);
                    qubit.length = size;
                    this.qubits.push(qubit);
                    return [new Use(new Str(id.id), qubit)];
                }
                else {
                    throw BadUseError;
                }
            }
            else {
                throw BadUseError;
            }
            // use (aux, register) = (Qubit(), Qubit[5]); style
        }
        else if (this.matchNext(tokens, [Token.Lbrac])) {
            let names = [];
            while (!(this.matchNext(tokens, [Token.Rbrac]))) {
                let id = this.identifier(tokens, true);
                if (id instanceof Id) {
                    names.push(id);
                }
                else {
                    throw BadUseError;
                }
                while (!(this.matchNext(tokens, [Token.Comma])) && !(this.matchNext(tokens, [Token.Rbrac]))) {
                    tokens = tokens.slice(1);
                }
                if (this.matchNext(tokens, [Token.Comma])) {
                    tokens = tokens.slice(1);
                }
            }
            if (this.matchNext(tokens, [Token.Eq])) {
                tokens = tokens.slice(1);
            }
            else {
                throw BadUseError;
            }
            if (this.matchNext(tokens, [Token.Lbrac])) {
                let vals = [];
                while (!(this.matchNext(tokens, [Token.Rbrac]))) {
                    // Qubit()
                    if (this.matchNext(tokens, [Token.QubitType, Token.Lbrac, Token.Rbrac])) {
                        vals.push(new Qubit(names[vals.length].id));
                        // Qubit[5]
                    }
                    else if (this.matchNext(tokens, [Token.QubitType, Token.Lsqbrac])) {
                        let len = new Int(Number(tokens.slice(2)[1]));
                        let q = new Qubit(names[vals.length].id, len);
                        vals.push(q);
                        this.qubits.push(q);
                    }
                    else {
                        throw BadUseError;
                    }
                    while (!(this.matchNext(tokens, [Token.Comma])) && !(this.matchNext(tokens, [Token.Rbrac]))) {
                        tokens = tokens.slice(1);
                    }
                    if (this.matchNext(tokens, [Token.Comma])) {
                        tokens = tokens.slice(1);
                    }
                }
                let res = [];
                for (let i = 0; i < names.length; i++) {
                    res.push(new Use(new Str(names[i].id), vals[i]));
                }
                return res;
            }
            else {
                throw BadUseError;
            }
        }
    }
    /**
     * Parses qubit borrow.
     * @param tokens - Qubit borrow tokens to parse.
     * @return A parsed qubit borrow.
     */
    borrow(tokens) {
        const uses = this.use(tokens);
        return uses.map((use) => {
            return new Borrow(use.name, use.qubits);
        });
    }
    /**
     * Parses an import.
     * @param tokens - Import tokens to parse.
     * @return A parsed import.
     */
    import(tokens) {
        let token = tokens[0];
        let name = this.parseSymbol(tokens);
        if (token[0] == Token.Identifier) {
            this.libraries.push(name[0].repr);
            if (token[1] != 'Std' && token[1] != 'Microsoft') {
                const q_sharp = fs.readFileSync(this.filePath + name.slice(1, name.length - 1) + '.qs', 'utf8');
                const lexer = new Lexer(q_sharp, 0);
                const tokens = lexer.lex();
                const parser = new Parser(tokens, true, this.filePath + name[0].repr.slice(1, name[0].repr.length - 1).split('/').slice(0, name[0].repr.slice(1, name[0].repr.length - 1).split('/').length - 1).join('/'));
                parser.symbols = this.symbols;
                parser.instances = this.instances;
                parser.libraries = this.libraries;
                parser.funcParsers = this.funcParsers;
                this.funcParsers[name[0].repr] = parser;
                return [new Import(name[0])];
            }
            else {
                return [new Import(name[0])];
            }
            // TODO: parse until semicolon
        }
        else {
            throw BadImportError;
        }
    }
    /**
     * Creates a new parser and copies the current parser's context to it.
     * @param tokens - Symbol tokens for the child parser to parse.
     * @return A new parser.
     */
    childParser(tokens) {
        let newParser = new Parser(tokens, true, this.filePath);
        newParser.symbols = this.symbols;
        newParser.instances = this.instances;
        newParser.libraries = this.libraries;
        newParser.funcParsers = this.funcParsers;
        return newParser;
    }
    /**
     * Parses an assignment.
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the assignment.
     */
    let(tokens) {
        let name;
        let exprTokens = [];
        if (this.matchNext(tokens, [Token.Let, Token.Identifier, Token.Eq])) {
            tokens = tokens.slice(1);
            name = tokens[0][1].toString();
            tokens = tokens.slice(2);
            let i = 0;
            while (tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Newline])) {
                exprTokens.push(tokens[i]);
                i++;
            }
            let exp = this.parseExpression(exprTokens)[0];
            this.variables.push(new Variable(name));
            return [new Let(exp, new Variable(name))];
        }
        else {
            throw BadBindingError;
        }
    }
    /**
     * Parses a mutable assignment.
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the assignment.
     */
    mutable(tokens) {
        let name;
        let exprTokens = [];
        if (this.matchNext(tokens, [Token.Let, Token.Identifier, Token.Eq])) {
            tokens = tokens.slice(1);
            name = tokens[0][1].toString();
            tokens = tokens.slice(2);
            let i = 0;
            while (tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Newline])) {
                exprTokens.push(tokens[i]);
                i++;
            }
            let exp = this.parseExpression(exprTokens)[0];
            this.variables.push(new Variable(name));
            return [new Mutable(exp, new Variable(name))];
        }
        else {
            throw BadBindingError;
        }
    }
    /**
     * Parses a conditional.
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the conditional.
     */
    if(tokens) {
        let clauseTokens = [];
        let conditionTokens = [];
        let i = 1;
        while (tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Newline])) {
            conditionTokens.push(tokens[i]);
            i++;
        }
        const condition = this.parseExpression(conditionTokens)[0];
        tokens = tokens.slice(conditionTokens.length + 1);
        let j = 1;
        while (tokens[j] != undefined && !this.matchNext(tokens.slice(j), [Token.Else]) && !this.matchNext(tokens.slice(j), [Token.Rcurlbrac])) {
            clauseTokens.push(tokens[j]);
            j++;
        }
        let ifParser = this.childParser(clauseTokens);
        this.clauseParsers.push(ifParser);
        const ifClause = ifParser.parse();
        tokens = tokens.slice(clauseTokens.length + 1);
        if (this.matchNext(tokens, [Token.Else])) {
            let k = 1;
            clauseTokens = [];
            while (tokens[k] != undefined && !this.matchNext(tokens.slice(k), [Token.Rcurlbrac])) {
                clauseTokens.push(tokens[k]);
                k++;
            }
            let elseParser = this.childParser(clauseTokens);
            this.clauseParsers.push(elseParser);
            const elseClause = elseParser.parse();
            tokens = tokens.slice(clauseTokens.length + 1);
            if (this.matchNext(tokens, [Token.Rcurlbrac])) {
                return [new Condition(condition, ifClause, elseClause)];
            }
            else {
                throw BadConditionStructureError;
            }
        }
        else {
            return [new Condition(condition, ifClause)];
        }
    }
    /**
     * Returns the type associated with a variable.
     * @param variable - The variable.
     * @returns The variable's bound type in this scope.
     */
    variableType(variable) {
        let found = false;
        let i = 0;
        while (found === false && i < this.variables.length) {
            if (this.variables[i].name == variable.name) {
                found = true;
                break;
            }
            i++;
        }
        if (i < this.variables.length && found === true) {
            return this.variableTypes[i];
        }
        else {
            throw UninitializedVariableError;
        }
    }
    /**
     * Parses a range.
     * @param tokens - The tokens to parse.
     * @return The parsed range.
     */
    range(tokens) {
        let lower;
        let upper;
        let step;
        let ranges = 0;
        let consumed = 0;
        while ((lower == undefined) || (upper == undefined)) {
            if (this.matchNext(tokens, [Token.Continue])) {
                if (lower == undefined) {
                    lower = new Continue();
                }
                else if (upper == undefined) {
                    upper = new Continue();
                }
                tokens = tokens.slice(1);
                consumed += 1;
            }
            else if (this.matchNext(tokens, [Token.Range])) {
                ranges += 1;
                tokens = tokens.slice(1);
                consumed += 1;
            }
            else if (!(this.matchNext(tokens, [Token.Continue]) || this.matchNext(tokens, [Token.Range])) && (step != undefined) && (ranges == 1)) {
                upper = step;
                step = undefined;
            }
            else {
                let thisConsumed = 0;
                if (lower == undefined) {
                    let [expr, exprConsumed] = this.parseExpression(tokens);
                    lower = expr;
                    thisConsumed = exprConsumed;
                }
                else if (step == undefined && lower != undefined && (ranges == 1 || lower instanceof Continue)) {
                    let [expr, exprConsumed] = this.parseExpression(tokens);
                    step = expr;
                    thisConsumed = exprConsumed;
                }
                else if (lower != undefined && step != undefined && (ranges == 2 || (lower instanceof Continue && ranges == 1))) {
                    let [expr, exprConsumed] = this.parseExpression(tokens);
                    upper = expr;
                    thisConsumed = exprConsumed;
                }
                consumed += thisConsumed;
                tokens = tokens.slice(thisConsumed);
            }
        }
        return [new Range(lower, upper, step), consumed + 1];
    }
    /**
     * Parses a for loop.
     *
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing loop.
     */
    for(tokens) {
        let iterName;
        let iterator;
        if (this.matchNext(tokens, [Token.Dummy, Token.In]) || this.matchNext(tokens, [Token.Identifier, Token.In])) {
            if (this.matchNext(tokens, [Token.Dummy])) {
                iterName = '_';
            }
            else {
                iterName = tokens[0][1].toString();
            }
            tokens = tokens.slice(2);
            if (this.matchNext(tokens, [Token.Lsqbrac, Token.Int])) {
                iterator = new For(tokens, this.matchIntList(tokens.slice(1)), new Variable(iterName));
            }
            else if (this.matchNext(tokens, [Token.Lsqbrac, Token.Identifier])) {
                iterator = new For(tokens, this.matchSymbolList(tokens.slice(1)), new Variable(iterName));
            }
            else if (this.matchNext(tokens, [Token.Identifier])) {
                iterator = new For(tokens, [this.parseSymbol(tokens)[0]], new Variable(iterName));
            }
            else {
                iterator = new For(tokens, this.range(tokens)[0], new Variable(iterName));
            }
            while (!this.matchNext(tokens, [Token.Newline])) {
                tokens = tokens.slice(1);
            }
            let k = 1;
            let clauseTokens = [];
            while (tokens[k] != undefined && !this.matchNext(tokens.slice(k), [Token.Rcurlbrac])) {
                clauseTokens.push(tokens[k]);
                k++;
            }
            let forParser = this.childParser(clauseTokens);
            let genName = iterator.variable.name;
            forParser.symbols.push(genName);
            forParser.parameters.push(genName);
            let forClause = forParser.parse();
            iterator.inside = forClause;
            return [iterator];
        }
        else {
            throw BadLoopError;
        }
    }
    /**
     * Parses a while loop.
     *
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the loop.
     */
    while(tokens) {
        let condition = null;
        if (this.matchNext(tokens, [Token.Lbrac])) {
            condition = this.parseExpression(tokens.slice(1))[0];
        }
        else {
            throw BadLoopError;
        }
        let k = 1;
        let clauseTokens = [];
        while (tokens[k] != undefined && !this.matchNext(tokens.slice(k), [Token.Rcurlbrac])) {
            clauseTokens.push(tokens[k]);
            k++;
        }
        let whileParser = this.childParser(clauseTokens);
        let whileClause = whileParser.parse();
        return [new While(whileClause, condition)];
    }
    /**
     * Parses a repeat loop.
     *
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the repeat.
     */
    repeat(tokens) {
        let k = 1;
        let clauseTokens = [];
        while (tokens[k] != undefined && !this.matchNext(tokens.slice(k), [Token.Rcurlbrac])) {
            clauseTokens.push(tokens[k]);
            k++;
        }
        let repeatParser = this.childParser(clauseTokens);
        let repeatClause = repeatParser.parse();
        let condition = null;
        if (this.matchNext(tokens, [Token.Until])) {
            condition = this.parseExpression(tokens.slice(1))[0];
        }
        else {
            throw BadLoopError;
        }
        if (this.matchNext(tokens, [Token.Fixup])) {
            let l = 1;
            let clauseTokens = [];
            while (tokens[l] != undefined && !this.matchNext(tokens.slice(l), [Token.Rcurlbrac])) {
                clauseTokens.push(tokens[l]);
                l++;
            }
            let fixupParser = this.childParser(clauseTokens);
            let fixupClause = fixupParser.parse();
            return [new Repeat(repeatClause, condition, fixupClause)];
        }
        else {
            throw BadLoopError;
        }
    }
    /**
     * Parses a list of integer values.
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the integer values.
     */
    matchIntList(tokens) {
        let args = [];
        let j = 0;
        while (j < tokens.length && !this.matchNext(tokens.slice(j), [Token.Newline])) {
            if (this.matchNext(tokens.slice(j), [Token.Int])) {
                let val = this.matchInt(tokens.slice(j));
                args.push(val);
            }
            else if (this.matchNext(tokens.slice(j), [Token.Continue, Token.Comma, Token.Int])) {
                let previous = args[args.length - 1].val;
                let step = previous - args[args.length - 2].val;
                let following = Number(tokens[j + 2][1]);
                let gen = previous;
                while (gen < following - 1) {
                    gen += step;
                    args.push(new Int(gen));
                }
            }
            else {
                throw BadIteratorError;
            }
            j++;
            if (this.matchNext(tokens.slice(j), [Token.Comma])) {
                j++;
            }
        }
        return args;
    }
    /**
     * Parses a list of symbols.
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the symbols.
     */
    matchSymbolList(tokens) {
        let args = [];
        let j = 0;
        while (j < tokens.length && this.matchNext(tokens.slice(j), [Token.Identifier])) {
            if (this.matchNext(tokens.slice(j), [Token.Identifier])) {
                let [val, consumed] = this.parseSymbol(tokens.slice(j));
                args.push(val);
                j += consumed;
            }
            else {
                throw BadIteratorError;
            }
            if (this.matchNext(tokens.slice(j), [Token.Comma])) {
                j++;
            }
        }
        return args;
    }
    /**
     * Parses an integer value.
     * @param tokens - Tokens to parse.
     * @return An AST node representing the value.
     */
    matchInt(tokens) {
        let val;
        if (tokens[0][0] == Token.Int) {
            val = new Int(Number(tokens[0][1]));
        }
        else {
            throw BadIntError;
        }
        return val;
    }
    /**
     * Checks if the next tokens match those expected.
     * @param tokens - Remaining tokens to parse.
     * @param expectedTokens - Expected tokens.
     * @return Whether there is a match.
     */
    matchNext(tokens, expectedTokens) {
        let matches = true;
        let i = 0;
        if (tokens.length == 0) {
            return false;
        }
        while (i < expectedTokens.length) {
            if (tokens[i] != undefined && tokens[i][0] != expectedTokens[i] && expectedTokens[i] != Token.Wild) {
                matches = false;
                break;
            }
            i++;
        }
        return matches;
    }
}
/** Class representing a struct parser. */
class StructParser extends Parser {
    parseSymbol(tokens) {
        let name;
        if (this.matchNext(tokens, [Token.Identifier])) {
            name = tokens[0][1].toString();
        }
        tokens = tokens.slice(1);
        if (this.hasVariable(name)) {
            throw BadStructError;
        }
        else {
            const variable = new Variable(name);
            this.variables.push(variable);
            return [variable, 1];
        }
        // TODO: variable types
    }
}
export default Parser;
//# sourceMappingURL=parser.js.map