import * as fs from 'fs';
import Lexer from './lexer';
import { 
    Token
} from './token';
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
} from './ast';
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
    BadIndexError
} from './errors';


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
            case Token.Lsqbrac:                                         // check this!
                return this.array(tokens.slice(1));
            case Token.Lcurlbrac:
                return this.struct(tokens.slice(1));
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
        }
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
            return this.symbol(tokens);
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
    struct(tokens:Array<[Token, (number | string)?]>, name: string | null): Array<AstNode> {
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
        return [new Struct(vals, names)];
    }

    /**
     * Parses an array.
     * @param tokens - Tokens to parse.
     * @return A parsed array.
     */
    array(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        return [new Arr()];
    }

    /**
     * Parses qubit usage.
     * @param tokens - Qubit usage tokens to parse.
     * @return A parsed qubit usage.
     */
    use(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        const qubits = new Tuple([new Qubit('name')], new Int(1));
        return [new Use(qubits)]; 
        // TODO: append to this.qubits
    }

    /**
     * Parses qubit borrow.
     * @param tokens - Qubit borrow tokens to parse.
     * @return A parsed qubit borrow.
     */
    borrow(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        const qubits = new Tuple([new Qubit('name')], new Int(1));
        return [new Borrow(qubits)]; 
    }

    /**
     * Parses an import.
     * @param tokens - Import tokens to parse.
     * @return A parsed import.
     */
    import(token:[Token, (number | String)?]): Array<AstNode> {
        let name:string = token[1].toString();

        if (token[0] ==  Token.String) {
            this.libraries.push(name);

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
     * Parses a symbol.
     * @param tokens - Symbol tokens to parse.
     * @return A parsed symbol.
     */
    symbol(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let names:Array<Qubit | Variable | Ancilliary | GetOutput> = [];

        while (this.matchNext(tokens, [Token.Identifier]) || this.matchNext(tokens, [Token.Ancilliary])) {
            let [symbol, consumed] = this.parseSymbol(tokens);
            names.push(symbol);
            tokens = tokens.slice(consumed);
        }
        if (names.length > 2) {
            throw BadFormatError;
        }
        if (this.matchNext(tokens, [Token.Minus]) || this.matchNext(tokens, [Token.Int]) || this.matchNext(tokens, [Token.Float])) {
            let val:number;

            if (this.matchNext(tokens, [Token.Minus])) {
                tokens = tokens.slice(1);
                val = -Number(tokens[0][1]);
            } else {
                val = Number(tokens[0][1]);
            }
            
            return names.length == 1 ? [new Weight(val, names[0])] : [new Coupling(val, names[0], names[1])];
        } else if (this.matchNext(tokens, [Token.Eq]) || this.matchNext(tokens, [Token.Neq])) {
            let chain = true;
            if (this.matchNext(tokens, [Token.Neq])) {
                chain = false;
            }
            tokens = tokens.slice(1);
            if (this.matchNext(tokens, [Token.Identifier]) || this.matchNext(tokens, [Token.Ancilliary])) {
                let i = 0;
                while (i < names.length) {
                    if (!(this.symbols.includes(names[i].name) || this.symbols.includes(names[i].name.split('[')[0]))) {
                        throw UndeclaredQubitError;
                    }
                    i++;
                }
                this.symbols.push(tokens[0][1].toString());
                let chained = this.parseSymbol(tokens)[0];
                return names.map((name) => chain 
                ? new Chain(name, chained) : new AntiChain(name, chained));
            } else if (this.matchNext(tokens, [Token.Next])) {
                let chained = this.parseSymbol(tokens)[0];
                return names.map((name) => chain ? new Chain(name, chained): new AntiChain(name, chained));
            } else {
                throw BadChainError;
            }
        } else if (this.matchNext(tokens, [Token.Binding])) {
            tokens = tokens.slice(1);
            let i = 0;
            while (i < names.length) {
                if (!this.symbols.includes(names[i].name) || !this.symbols.includes(names[i].name.split('[')[0])) {
                    this.symbols.push(names[i].name);
                }
                i++;
            }
            if (this.matchNext(tokens, [Token.Identifier]) || this.matchNext(tokens, [Token.Ancilliary])) {
                if (!this.variables.includes(tokens[0][1].toString())) {
                    throw UndeclaredVariableError;
                }
                return names.map((name) => new Pin(name, new Variable(tokens[0][1].toString())));
            } else {
                let exprTokens = [];
                let i = 0;
                while (tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Newline])) {
                    exprTokens.push(tokens[i]);
                    i++;
                }
                let exp = this.parseExpression(exprTokens);
                return names.map((name) => new Pin(name, exp));
            }
        } else if (this.matchNext(tokens, [Token.Equiv]) || this.matchNext(tokens, [Token.Convert])) {
            let equiv = true;
            if (this.matchNext(tokens, [Token.Convert])) {
                equiv = false;
            }
            tokens = tokens.slice(1);
            if (this.matchNext(tokens, [Token.Identifier]) || this.matchNext(tokens, [Token.Ancilliary])) {
                let i = 0;
                while (i < names.length) {
                    if (!this.symbols.includes(names[i].name)|| !this.symbols.includes(names[i].name.split('[')[0])) {
                        throw UndeclaredQubitError;
                    }
                    i++;
                }
                const sym = this.parseSymbol(tokens)[0];
                this.symbols.push(sym.name);
                return names.map((name) => equiv ? new Equivalence(name, sym) : new Convert(name, sym));
            } else {
                throw BadEquivalenceError;
            }
        }
        throw BadDeclarationError;
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

        if (this.matchNext(tokens, [Token.Let, Token.Identifier, Token.Binding])) {
            tokens = tokens.slice(1);
            name = tokens[0][1].toString();
            tokens = tokens.slice(2);
            let i = 0;
            while (tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Newline])) {
                exprTokens.push(tokens[i]);
                i++;
            }
            let exp = this.parseExpression(exprTokens);
            this.variables.push(name);
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

        if (this.matchNext(tokens, [Token.Let, Token.Identifier, Token.Binding])) {
            tokens = tokens.slice(1);
            name = tokens[0][1].toString();
            tokens = tokens.slice(2);
            let i = 0;
            while (tokens[i] != undefined && !this.matchNext(tokens.slice(i), [Token.Newline])) {
                exprTokens.push(tokens[i]);
                i++;
            }
            let exp = this.parseExpression(exprTokens);
            this.variables.push(name);
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
        while (tokens[j] != undefined && !this.matchNext(tokens.slice(j), [Token.Else]) && !this.matchNext(tokens.slice(j), [Token.EndIf])) {
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
            while (tokens[k] != undefined && !this.matchNext(tokens.slice(k), [Token.EndIf])) {
                clauseTokens.push(tokens[k]);
                k++;
            }
            let elseParser = this.childParser(clauseTokens);

            this.clauseParsers.push(elseParser);
            const elseClause = elseParser.parse();
            tokens = tokens.slice(clauseTokens.length + 1);

            if (this.matchNext(tokens, [Token.EndIf])) {
                return [new Condition(condition, ifClause, elseClause)];
            } else {
                throw BadConditionStructureError;
            }
        } else if (this.matchNext(tokens, [Token.EndIf])) {
            return [new Condition(condition, ifClause)];
        } else {
            throw BadConditionStructureError;
        }
    }

    /**
     * Parses a for loop using loop unrolling.
     * 
     * TODO: replace loop unrolling with symbolic loop representation.
     * 
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the unrolled loop.
     */
    for(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        let iterName:string;
        let iterator:Iterator;
        let generated:Array<AstNode> = [];

        if (this.matchNext(tokens, [Token.Identifier, Token.Binding])) {
            iterName = tokens[0][1].toString();
            tokens = tokens.slice(2);

            if (this.matchNext(tokens, [Token.Int])) {
                iterator = new Iterator(iterName, this.matchIntList(tokens));
            } else if (this.matchNext(tokens, [Token.Identifier])) {
                iterator = new Iterator(iterName, this.matchSymbolList(tokens));
            }
            while (!this.matchNext(tokens, [Token.Newline])) {
                tokens = tokens.slice(1);
            }

            let k = 1;
            let clauseTokens = [];
            while (tokens[k] != undefined && !this.matchNext(tokens.slice(k), [Token.EndFor])) {
                clauseTokens.push(tokens[k]);
                k++;
            }
            let forParser = this.childParser(clauseTokens);
            
            let genName = iterator.name;
            forParser.symbols.push(genName);
            forParser.parameters.push(genName);
            let forClause = forParser.parse();

            iterator.vals.forEach((val, i) => {
                generated.push(new Let(new Expression([val]), new Variable(genName)));
                forClause.forEach((node) => {
                    generated.push(node);
                });
            });

            this.clauseParsers.push(forParser);

            return generated;
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
        return [new While()];
    }

    /**
     * Parses a repeat loop.
     * 
     * @param tokens - Tokens to parse.
     * @return An array of AST nodes representing the repeat.
     */
    repeat(tokens:Array<[Token, (number | String)?]>): Array<AstNode> {
        return [new Repeat()];
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
    matchSymbolList(tokens:Array<[Token, (number | String)?]>): Array<Qubit | Variable> {
        let args:Array<Qubit | Variable> = [];
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

    parseSymbol(tokens:Array<[Token, (number | string)?]>): [Variable, number] {
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
