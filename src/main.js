import Compiler from './compiler.js';
import Parser from './parser.js';
import Lexer from './lexer.js';
import * as fs from 'fs';
/**
 * Returns the abstract syntax tree for a given string of Q# code.
 * @param q_sharp - The code string.
 * @return The corresponding AST.
 */
function parseString(q_sharp) {
    const lexer = new Lexer(q_sharp, 0);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    return ast;
}
/**
 * Returns the compiled QASM code for a given string of Q# code.
 * @param q_sharp - The code string.
 * @return The compiled QASM.
 */
function compileString(q_sharp) {
    const lexer = new Lexer(q_sharp, 0);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const compiler = new Compiler(ast, '../spec/q-sharp/', parser.qubits, parser.variables, parser.variableTypes);
    const [qasm, compatible, qasmAst] = compiler.compile();
    if (!compatible) {
        console.log('WARNING! The Q# code is not fully supported by the compiler.');
    }
    return qasm;
}
/**
 * Returns the abstract syntax tree for a given Q# file.
 * @param file - The file location.
 * @return The corresponding AST.
 */
exports.parse = function (file) {
    return parseString(fs.readFileSync(file, 'utf8'));
};
/**
 * Returns the compiled QASM code for a given string of Q# file.
 * @param file - The file location.
 * @return The corresponding AST.
 */
exports.compile = function (file) {
    return compileString(fs.readFileSync(file, 'utf8'));
};
exports.parseString = parseString;
exports.compileString = compileString;
//# sourceMappingURL=main.js.map