import * as fs from 'fs';
import Lexer from './lexer.js';
import { 
    Token
} from './token.js';
import { 
    AstNode,
    Assert,
    Id,
    Arr,
    Int,
    Bool,
    Mod,
    Parameter,
    Condition,
    Minus,
    Plus,
    Times,
    Divide,
    Exp,
    Str,
    Geq,
    Leq,
    Neq,
    Expression,
    Qubit,
    Or,
    Less,
    More,
    And,
    Not,
    Left,
    Right,
    Variable,
    Let,
    SetParam,
    Range,
    Struct,
    Operation,
    Function,
    BigInt,
    Result,
    Double,
    Unit,
    Pauli,
    Eq,
    Peq,
    Meq,
    Dummy,
    BitwiseAnd,
    BitwiseNot,
    BitwiseOr,
    BitwiseXor,
    Use,
    Borrow,
    Import,
    Mutable,
    Unwrap,
    For,
    While,
    Repeat,
    Fail,
    Return,
    Conjugation,
    Paulis,
    Tuple,
    Modifier,
    AstType,
    IndexedSet,
    GetParam,
    ArrayType,
    Comment,
    AND,
    CCNOT,
    CNOT,
    Ex,
    H,
    I,
    M,
    Measure,
    R,
    R1,
    R1Frac,
    Reset,
    ResetAll,
    RFrac,
    Rx,
    Rxx,
    Ry,
    Ryy,
    Rz,
    Rzz,
    S,
    SWAP,
    T,
    X,
    Y,
    Z,
    ApplyUnitary,
    Message,
} from './ast.js';
import {
    BadImportError,
    BadFunctionNameError,
    BadConjugationError,
    BadOperationNameError,
    BadIntError,
    BadIteratorError,
    BadLoopError,
    BadConditionStructureError,
    BadBindingError,
    BadIdentifierError,
    BadStructError,
    UninitializedInstanceError,
    BadIndexError,
    BadArrayError,
    BadUseError,
    UninitializedVariableError
} from './errors.js';


/** Class representing a token parser. */
class Parser {

    tokens:Array<[Token, (number | String)?]>;
    libraries:Array<string>;
    symbols:Array<string>;
    qubits:Array<Qubit>;
    variables:Array<Variable>;
    variableTypes:Array<AstType>;
    instances:Object;
    parameters:Array<string>;
    prepStates:Array<string>;
    clauseParsers:Array<Parser>;
    funcParsers:Object;
    operationParsers:Object;
    structParsers:Array<StructParser>;
    isSubContext:boolean;
    filePath:string;
    
    /**
     * Creates a parser.
     * @param tokens - Tokens to parse.
     */
    constructor(tokens:Array<[Token, (number | String)?]>, isSubContext:boolean=false, filePath:string='') {
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
     * Calling this method parses the code represented by the provided tokens.
     * @return The abstract syntax tree.
     */
    parse(): Array<AstNode> {
        let ast:Array<AstNode> = [];
        let i = 0;
        while (i < (this.tokens.length - 1)) {
            let nodes = this.parseNode(this.tokens.slice(i));
            ast = ast.concat(
                    nodes ? nodes : []
                );

            // replace with various ways to declare functions
            if (this.tokens[i][0] == Token.Rcurlbrac) {
                while (!(this.tokens[i] == undefined) && !(this.matchNext(this.tokens.slice(i), [Token.EndOfFile])) && !(this.matchNext(this.tokens.slice(i), [Token.Rcurlbrac]))) {
                    i++;
                }
                i++;
            // turnary, etc. need to be here too
            } else if (this.tokens[i][0] == Token.If) {
                while (!(this.tokens[i] == undefined) && !(this.matchNext(this.tokens.slice(i), [Token.EndOfFile])) && !(this.matchNext(this.tokens.slice(i), [Token.Else]))) {
                    i++;
                }
            // all the types of iterators go here
            } else if (this.tokens[i][0] == Token.For) {
                while (!(this.tokens[i] == undefined) && !(this.matchNext(this.tokens.slice(i), [Token.EndOfFile])) && !(this.matchNext(this.tokens.slice(i), [Token.Rcurlbrac]))) {
                    i++;
                }
            } else {
                while (!(this.tokens[i] == undefined) && !(this.matchNext(this.tokens.slice(i), [Token.EndOfFile])) && !(this.matchNext(this.tokens.slice(i), [Token.Newline]))) {
                    i++;
                }
            }
            i++;
        }
        return ast;
    }

    /**
     * Delegates the parsing of the next set of tokens to the appropriate method.
     * @param tokens - Remaining tokens to parse.
     * @param allowVariables - Whether encountered identifiers should be consider variable initializations or references.
     * @return A set of AST nodes.
     */
    parseNode(tokens:Array<[Token, (number | String)?]>, allowVariables:boolean=false): Array<AstNode> {
        const token = tokens[0];
        switch(token[0]) {
            // TODO: cases for intrinsic lib
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
                return this.singleQubitGate(tokens.slice(1), M);   // check this!
            case Token.R:
                return this.singleRotationGate(tokens.slice(1), H);
            case Token.R1:
                return this.singleRotationGate(tokens.slice(1), R1);
            case Token.R1Frac:
                return this.singleRotationGate(tokens.slice(1), R1Frac);
            case Token.Reset:
                return this.singleQubitGate(tokens.slice(1), Reset);
            case Token.ResetAll:
                return [new ResetAll()];
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
            case Token.Message:
                return [new Comment(tokens[1].toString())];
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
                return this.return(tokens.slice(1));
            case Token.Fail:
                return this.fail(tokens.slice(1));
            case Token.Identifier:
                this.identifier(tokens, allowVariables);
            case Token.Function:
                return this.function(tokens.slice(1));
            case Token.Use:
                return this.use(tokens.slice(1));
            case Token.Operation:
                return this.operation(tokens.slice(1));
            case Token.Lsqbrac:
                return this.array(tokens.slice(1));
            case Token.StructType:
                return this.struct(tokens.slice(2), (tokens[1][1] as string));
            case Token.Import:
                return this.import(tokens[1]);
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
                return [new Str((token[1] as any))];
            case Token.Within:
                return this.conjugation(tokens.slice(0));
            case Token.Comment:
                return [new Comment(token[1].toString())];
        }
    }

    /**
     * Parses a single qubit gate application.
     * @param tokens - Tokens to parse.
     * @return A parsed gate application.
     */
    singleQubitGate(tokens:Array<[Token, (number | String)?]>, gateClass): Array<AstNode> {
        // TODO
    }

    /**
     * Parses a two qubit gate application.
     * @param tokens - Tokens to parse.
     * @return A parsed gate application.
     */
    twoQubitGate(tokens:Array<[Token, (number | String)?]>, gateClass): Array<AstNode> {
        // TODO
    }

    /**
     * Parses a single qubit rotation.
     * @param tokens - Tokens to parse.
     * @return A parsed gate application.
     */
    singleRotationGate(tokens:Array<[Token, (number | String)?]>, gateClass): Array<AstNode> {
        // TODO
    }

    /**
     * Parses an arbitrary unitary.
     * @param tokens - Tokens to parse.
     * @return A parsed unitary application.
     */
    unitary(tokens:Array<[Token, (number | String)?]): Array<AstNode> {
        // TODO
    }

    /**
     * Parses an two qubit rotation.
     * @param tokens - Tokens to parse.
     * @return A parsed gate application.
     */
    isingRotationGate(tokens:Array<[Token, (number | String)?]>, gateClass): Array<AstNode> {
        // TODO
    }

    /**
     * Parses a logical and mathematical expression.
     * @param tokens - Expression tokens to parse.
     * @return A parsed expression.
     */
    parseExpression(tokens:Array<[Token, (number | String)?]>): Expression {
        let elements:Array<Parameter> = [];

        while (tokens.length > 0) {
            if (tokens[0][0] != Token.Lbrac) {
                let node = this.parseNode(tokens, true);
                if (node != undefined) {
                    for (let i in node) {
                        elements.push((node[i] as any));
                    }
                }
                if (this.matchNext(tokens, [Token.Identifier, Token.Lsqbrac])) {
                    while (!this.matchNext(tokens, [Token.Rsqbrac]) && !(tokens[0] == undefined)) {
                        tokens = tokens.slice(1);
                    }
                }
                tokens = tokens.slice(1);
            } else {
                let exprTokens:Array<[Token, (number | String)?]> = [];
                let j = 1;
                while (tokens[j] != undefined && !this.matchNext(tokens.slice(j), [Token.Newline]) && !this.matchNext(tokens.slice(j), [Token.Rbrac])) {
                    exprTokens.push(tokens[j]);
                    j++;
                }
                let exp = this.parseExpression(exprTokens);
                elements.push(exp);
                tokens = tokens.slice(exprTokens.length + 2);
            }
        }

        return new Expression(elements);
    }

    /**
     * Parses a conjugation.
     * @param tokens - Tokens to parse.
     * @return A parsed conjugation.
     */
    conjugation(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let withinTokens:Array<[Token, (number | String)?]> = [];
        let applyTokens:Array<[Token, (number | String)?]> = [];

        if (this.matchNext(tokens, [Token.Within, Token.Lcurlbrac])) {
            tokens = tokens.slice(1);

            let i = 0;
            while (tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Rcurlbrac])) {
                withinTokens.push(tokens[i]);
                i++;
            }
            let withinParser = this.childParser(withinTokens);
            let withinCode = withinParser.parse();

            if (this.matchNext(tokens, [Token.Apply, Token.Lcurlbrac])) {
                tokens = tokens.slice(1);

                let j = 0;
                while (tokens[j] != undefined && !this.matchNext(tokens.slice(j), [Token.Rcurlbrac])) {
                    applyTokens.push(tokens[j]);
                    i++;
                }
                let applyParser = this.childParser(applyTokens);
                let applyCode = applyParser.parse();

                return [new Conjugation(withinCode, applyCode)];

            } else {
                throw BadConjugationError;
            }
        }
    }

    /**
     * Whether a variable is known.
     * @param name - The string name of the variable.
     * @return Whether it corresponds to a variable in this.variables.
     */
    hasVariable(name: string): boolean {
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
    hasQubit(name: string): boolean {
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
    return(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        return [new Return(this.parseExpression(tokens.slice(1)))];
    }

    /**
     * Parses an fail statement.
     * @param tokens - Tokens to parse.
     * @return A parsed fail statement.
     */
    fail(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        return [new Fail(new Str((tokens[1] as any)))];
    }

    /**
     * Parses an operation.
     * @param tokens - Tokens to parse.
     * @return A parsed operation.
     */
    operation(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let name:string;
        let operationTokens:Array<[Token, (number | String)?]> = [];
        let operationParams:Array<Parameter> = [];
        let modifierTokens: Array<Modifier> = [];

        if (this.matchNext(tokens, [Token.Identifier, Token.Lbrac])) {
            name = tokens[0][1].toString();
            tokens = tokens.slice(1);

            let i = 0;
            while (tokens[i] != undefined && !(this.matchNext(tokens.slice(i), [Token.Rbrac]))) {
                operationParams.push(this.parseExpression(tokens.slice(i)));
                i++;
            }

            if (this.matchNext(tokens.slice(i), [Token.Unit, Token.Is])) {
                modifierTokens = this.modifiers(tokens.slice(i + 2));
            }

            let j = i + 2 + modifierTokens.length;
            while (tokens[j] != undefined && !this.matchNext(tokens.slice(j), [Token.Rcurlbrac])) {
                operationTokens.push(tokens[j]);
                j++;
            }
            let operationParser = this.childParser(operationTokens);

            let operationCode = operationParser.parse();

            this.libraries.push(name);
            this.operationParsers[name] = operationParser;

            return [new Operation(name, operationCode, operationParams, modifierTokens)];
        } else {
            throw BadOperationNameError;
        }
    }

    /**
     * Parses a list of modifiers.
     * @param tokens - Modifiers to parse.
     * @return Parsed modifiers.
     */
    modifiers(tokens:Array<[Token, (number | String)?]>): Array<Modifier> {
        let modifiers:Array<Modifier> = [];

        let i = 0;
        while (tokens[i] != undefined && !(this.matchNext(tokens.slice(i), [Token.Lcurlbrac]))) {
            if (this.matchNext(tokens.slice(i), [Token.Adjoint])) {
                modifiers.push(Modifier.Adjoint);
            } else if (this.matchNext(tokens.slice(i), [Token.Controlled])) {
                modifiers.push(Modifier.Controlled);
            }
        }

        return modifiers;
    }

    /**
     * Parses a function.
     * @param tokens - Function tokens to parse.
     * @return A parsed function.
     */
    function(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let name:string;
        let functionTokens:Array<[Token, (number | String)?]> = [];
        let functionParams:Array<Parameter> = [];

        if (this.matchNext(tokens, [Token.Identifier, Token.Lbrac])) {
            name = tokens[0][1].toString();
            tokens = tokens.slice(1);

            let i = 0;
            while (tokens[i] != undefined && !(this.matchNext(tokens.slice(i), [Token.Rbrac]))) {
                functionParams.push(this.parseExpression(tokens.slice(1)));
                i++;
            }

            let j = i;
            while (tokens[j] != undefined && !this.matchNext(tokens.slice(j), [Token.Rcurlbrac])) {
                functionTokens.push(tokens[j]);
                j++;
            }
            let functionParser = this.childParser(functionTokens);

            let functionCode = functionParser.parse();

            this.libraries.push(name);
            this.funcParsers[name] = functionParser;

            return [new Function(name, functionCode, functionParams)];
        } else {
            throw BadFunctionNameError;
        }
    }

        /**
     * Parses an Identifier or Ancilliary symbol.
     * @param tokens - Symbol tokens to parse.
     * @return A parsed symbol.
     */
    parseSymbol(tokens:Array<[Token, (number | String)?]>): [Qubit | Variable | GetParam, number] {
        let name:string;

        if (this.matchNext(tokens, [Token.Identifier])) {
            name = tokens[0][1].toString();
        }

        tokens = tokens.slice(1);

        if (this.matchNext(tokens, [Token.Lsqbrac])) {
            tokens = tokens.slice(1);
            if (this.matchNext(tokens, [Token.Identifier])) {
                let index = new Variable(tokens[0][1].toString());
                if (this.hasVariable(tokens[0][1].toString())) {
                    return [new GetParam(name, index), 4];
                } else {
                    throw BadIndexError;
                }
            } else if (this.matchNext(tokens, [Token.Int])) {
                let index = new Int(tokens[0][1] as number);
                tokens = tokens.slice(1);
                if (this.matchNext(tokens, [Token.Colon, Token.Int])) {
                    let range = new Range(index, new Int((tokens[1][1] as number)));
                    return [new GetParam(name, range), 6];
                } else {
                    return [new GetParam(name, index), 4];
                }
            } else {
                throw BadIndexError;
            }
        } else if (this.matchNext(tokens, [Token.Period, Token.Identifier])) {
            if (Object.keys(this.instances).includes(name)) {
                let inst = name;
                return [new GetParam(inst, (this.parseSymbol(tokens.slice(1))[0] as Variable)), 3];
            } else {
                throw UninitializedInstanceError;
            }
        } else if (this.hasVariable(name)) {
            return [new Variable(name), 1];
        } else if (this.hasQubit(name)) {
            return [new Qubit(name), 1];
        } else {
            throw UninitializedInstanceError;
        }
    }

    /**
     * Parses and identifier.
     * @param tokens - Tokens to parse.
     * @return A parsed identifier.
     */
    identifier(tokens:Array<[Token, (number | String)?]>, allowVariables): Array<AstNode> {
        if (!allowVariables) {
            this.symbols.push(tokens[0][1].toString());
            return this.parseSymbol(tokens);
        } else if (allowVariables) {
            if (this.symbols.includes(tokens[0][1].toString())) {
                return [this.parseSymbol(tokens)[0]];
            }
        }
        throw BadIdentifierError;
    }

    /**
     * Parses a struct.
     * @param tokens - Tokens to parse.
     * @return A parsed struct.
     */
    struct(tokens:Array<[Token, (number | String)?]>, name: string | null): Array<AstNode> {
        let names: Array<Id> = [];
        let vals: Array<AstNode> = [];
        let [id, consumed] = ['', 0];
        while (!(this.matchNext(tokens, [Token.Rcurlbrac]))) {
            if (this.matchNext(tokens, [Token.Identifier, Token.Colon])) {
                if (Object.keys(this.structParsers).includes(name)) {
                    [id, consumed] = this.structParsers[name].parseSymbol(tokens);
                    tokens = tokens.slice(consumed);
                } else {
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
            } else {
                throw BadStructError;
            }
        }
        return [new Struct(vals as Array<Parameter>, names)];
    }

    /**
     * Parses an array.
     * @param tokens - Tokens to parse.
     * @return A parsed array.
     */
    array(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let vals: Array<Parameter> = [];
        while (!(this.matchNext(tokens, [Token.Rsqbrac]))) {
            let param = this.parseNode(tokens);
            if (param instanceof Parameter) {
                vals.push(param);
            } else {
                throw BadArrayError;
            }
            while (!(this.matchNext(tokens, [Token.Comma])) && !(this.matchNext(tokens, [Token.Rsqbrac]))) {
                tokens = tokens.slice(1);
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
    use(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        // use qubit = Qubit(); style
        if (this.matchNext(tokens, [Token.Identifier, Token.Eq])) {
            const id = this.identifier(tokens, true);
            if (id instanceof Id) {
                const qubit = new Qubit(id.id);
                tokens = tokens.slice(2);
                if (this.matchNext(tokens, [Token.QubitType, Token.Lbrac, Token.Rbrac])) {
                    this.qubits.push(qubit);
                    return [new Use(new Str(id.id), qubit)];
                } else {
                    throw BadUseError;
                }
            } else {
                throw BadUseError;
            }
        // use (aux, register) = (Qubit(), Qubit[5]); style
        } else if (this.matchNext(tokens, [Token.Lbrac])) {
            let names: Array<Id> = [];
            while (!(this.matchNext(tokens, [Token.Rbrac]))) {
                let id = this.identifier(tokens, true);
                if (id instanceof Id) {
                    names.push(id);
                } else {
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
            } else {
                throw BadUseError;
            }
            if (this.matchNext(tokens, [Token.Lbrac])) {
                let vals: Array<Qubit> = [];
                while (!(this.matchNext(tokens, [Token.Rbrac]))) {
                    // Qubit()
                    if (this.matchNext(tokens, [Token.QubitType, Token.Lbrac, Token.Rbrac])) {
                        vals.push(new Qubit(names[vals.length].id));
                    // Qubit[5]
                    } else if (this.matchNext(tokens, [Token.QubitType, Token.Lsqbrac])) {
                        let len = new Int(Number(tokens.slice(2)[1]));
                        let q = new Qubit(names[vals.length].id, len);
                        vals.push(q);
                        this.qubits.push(q);
                    } else {
                        throw BadUseError;
                    }
                    while (!(this.matchNext(tokens, [Token.Comma])) && !(this.matchNext(tokens, [Token.Rbrac]))) {
                        tokens = tokens.slice(1);
                    }
                    if (this.matchNext(tokens, [Token.Comma])) {
                        tokens = tokens.slice(1);
                    }
                }
                let res:Array<Use> = [];
                for (let i = 0; i < names.length; i++) {
                    res.push(new Use(new Str(names[i].id), vals[i]));
                }
                return res;
            } else {
                throw BadUseError;
            }
        }
    }

    /**
     * Parses qubit borrow.
     * @param tokens - Qubit borrow tokens to parse.
     * @return A parsed qubit borrow.
     */
    borrow(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        const uses = this.use(tokens);
        return uses.map((use:Use) => {
            return new Borrow(use.name, use.qubits);
        });

    }

    /**
     * Parses an import.
     * @param tokens - Import tokens to parse.
     * @return A parsed import.
     */
    import(token:[Token, (number | String)?]): Array<AstNode> {
        let name:string = token[1].toString();

        if (token[0] ==  Token.Identifier) {
            this.libraries.push(name);

            if (token[1] != 'Std') {
                const q_sharp = fs.readFileSync(this.filePath + name.slice(1, name.length - 1) + '.qs', 'utf8');
            
                const lexer = new Lexer(q_sharp, 0);
                const tokens = lexer.lex();
    
                const parser = new Parser(tokens, true, this.filePath + name.slice(1, name.length - 1).split('/').slice(0, name.slice(1, name.length - 1).split('/').length - 1).join('/'));
                parser.symbols = this.symbols;
                parser.instances = this.instances;
                parser.libraries = this.libraries;
                parser.funcParsers = this.funcParsers;
                
                this.funcParsers[name] = parser;
    
                return [new Import(name)];
            } else {
                return [new Import(name)];
            }
            // TODO: parse until semicolon
        } else {
            throw BadImportError;
        }
    }

    /**
     * Parses an assertion.
     * @param tokens - Assertion tokens to parse.
     * @return A parsed assertion.
     */
    assert(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let exprTokens:Array<[Token, (number | String)?]> = [];

        let i = 0;
        while (tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Newline])) {
            exprTokens.push(tokens[i]);
            i++;
        }
        let exp = this.parseExpression(exprTokens);
        return [new Assert(exp)];
    }

    /**
     * Creates a new parser and copies the current parser's context to it.
     * @param tokens - Symbol tokens for the child parser to parse.
     * @return A new parser.
     */
    childParser(tokens:Array<[Token, (number | String)?]>): Parser {
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
    let(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let name:string;
        let exprTokens:Array<[Token, (number | String)?]> = [];

        if (this.matchNext(tokens, [Token.Let, Token.Identifier, Token.Eq])) {
            tokens = tokens.slice(1);
            name = tokens[0][1].toString();
            tokens = tokens.slice(2);
            let i = 0;
            while (tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Newline])) {
                exprTokens.push(tokens[i]);
                i++;
            }
            let exp = this.parseExpression(exprTokens);
            this.variables.push(new Variable(name));
            return [new Let(exp, new Variable(name))];
        } else {
            throw BadBindingError;
        }
    }

    /**
     * Parses a mutable assignment.
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the assignment.
     */
    mutable(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let name:string;
        let exprTokens:Array<[Token, (number | String)?]> = [];

        if (this.matchNext(tokens, [Token.Let, Token.Identifier, Token.Eq])) {
            tokens = tokens.slice(1);
            name = tokens[0][1].toString();
            tokens = tokens.slice(2);
            let i = 0;
            while (tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Newline])) {
                exprTokens.push(tokens[i]);
                i++;
            }
            let exp = this.parseExpression(exprTokens);
            this.variables.push(new Variable(name));
            return [new Mutable(exp, new Variable(name))];
        } else {
            throw BadBindingError;
        }
    }

    /**
     * Parses a conditional.
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the conditional.
     */
    if(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let clauseTokens:Array<[Token, (number | String)?]> = [];
        let conditionTokens:Array<[Token, (number | String)?]> = [];

        let i = 1;
        while (tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Newline])) {
            conditionTokens.push(tokens[i]);
            i++;
        }
        const condition = this.parseExpression(conditionTokens);
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
            } else {
                throw BadConditionStructureError;
            }
        } else if (this.matchNext(tokens, [Token.Rcurlbrac])) {
            return [new Condition(condition, ifClause)];
        } else {
            throw BadConditionStructureError;
        }
    }

    /**
     * Returns the type associated with a variable.
     * @param variable - The variable.
     * @returns The variable's bound type in this scope.
     */
    variableType(variable: Variable) {
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
        } else {
            throw UninitializedVariableError;
        }
    }

    /**
     * Parses a for loop using loop unrolling.
     * 
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the unrolled loop.
     */
    for(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let iterName:string;
        let iterator:For;
        let generated:Array<AstNode> = [];

        if (this.matchNext(tokens, [Token.Identifier, Token.Eq])) {
            iterName = tokens[0][1].toString();
            tokens = tokens.slice(2);

            if (this.matchNext(tokens, [Token.Int])) {
                iterator = new For(tokens, this.matchIntList(tokens), new Variable(iterName));
            } else if (this.matchNext(tokens, [Token.Identifier])) {
                iterator = new For(tokens, this.matchSymbolList(tokens) as Array<Variable>, new Variable(iterName));
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

            let list = [];
            let unroll = true;
            if (iterator.vals instanceof Range) {
                let it = iterator.vals.lower;
                while (it < iterator.vals.upper) {
                    list.push(it);
                }
            } else if (iterator.vals instanceof Array) {
                list = iterator.vals;
            } else if (iterator.vals instanceof Variable) {
                if (this.variableType(iterator.vals) == ArrayType) {
                    unroll = false;
                } else {
                    throw TypeError;
                }
            }

            if (unroll) {
                list.forEach((val, i) => {
                    generated.push(new Let(new Expression([val]), new Variable(genName)));
                    forClause.forEach((node) => {
                        generated.push(node);
                    });
                });
            
    
                this.clauseParsers.push(forParser);
    
                return generated;
            } else {
                return [new For(forClause, this.matchIntList(tokens), new Variable(iterName))];
            }
        } else {
            throw BadLoopError;
        }
    }

    /**
     * Parses a while loop.
     * 
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the loop.
     */
    while(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let condition:Expression = null;
        if (this.matchNext(tokens, [Token.Lbrac])) {
            condition = this.parseExpression(tokens.slice(1));
        } else {
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
    repeat(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let k = 1;
        let clauseTokens = [];
        while (tokens[k] != undefined && !this.matchNext(tokens.slice(k), [Token.Rcurlbrac])) {
            clauseTokens.push(tokens[k]);
            k++;
        }
        let repeatParser = this.childParser(clauseTokens);
        let repeatClause = repeatParser.parse();

        let condition:Expression = null;
        if (this.matchNext(tokens, [Token.Until])) {
            condition = this.parseExpression(tokens.slice(1));
        } else {
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
        } else {
            throw BadLoopError;
        }
    }

    /**
     * Parses a list of integer values.
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the integer values.
     */
    matchIntList(tokens:Array<[Token, (number | String)?]>): Array<Int> {
        let args:Array<Int> = [];
        let j:number = 0;

        while(j < tokens.length && !this.matchNext(tokens.slice(j), [Token.Newline])) {
            
            if (this.matchNext(tokens.slice(j), [Token.Int])) {
                let val = this.matchInt(tokens.slice(j));
                args.push(val);
            } else if (this.matchNext(tokens.slice(j), [Token.Continue, Token.Comma, Token.Int])) {
                let previous = args[args.length - 1].val;
                let step = previous - args[args.length - 2].val;
                let following = Number(tokens[j + 2][1]);

                let gen = previous;
                while (gen < following - 1) {
                    gen += step;
                    args.push(new Int(gen));
                }
            } else {
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
    matchSymbolList(tokens:Array<[Token, (number | String)?]>): Array<Qubit | Variable | GetParam> {
        let args:Array<Qubit | Variable | GetParam> = [];
        let j:number = 0;

        while(j < tokens.length && !this.matchNext(tokens.slice(j), [Token.Newline])) {
            
            if (this.matchNext(tokens.slice(j), [Token.Identifier])) {
                let [val, consumed] = this.parseSymbol(tokens.slice(j));
                args.push(val);
                j += consumed;
            } else {
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
    matchInt(tokens:Array<[Token, (number | String)?]>): Int {
        let val:Int;

        if (tokens[0][0] == Token.Int) {
            val = new Int(Number(tokens[0][1]));
        } else {
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
    matchNext(tokens:Array<[Token, (number | String)?]>, expectedTokens:Array<Token>): boolean {
        let matches = true;
        let i = 0;

        if (tokens.length == 0) {
            return false;
        }

        while (i < expectedTokens.length) {
            if (tokens[i] != undefined && tokens[i][0] != expectedTokens[i]) {
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

    parseSymbol(tokens:Array<[Token, (number | String)?]>): [Variable, number] {
        let name:string;

        if (this.matchNext(tokens, [Token.Identifier])) {
            name = tokens[0][1].toString();
        }

        tokens = tokens.slice(1);

        if (this.hasVariable(name)) {
            throw BadStructError;
        } else {
            const variable = new Variable(name);
            this.variables.push(variable);
            return [variable, 1];
        }

        // TODO: variable types
    }
}

export default Parser;
