import Parser from './parser.js';
import Lexer from './lexer.js';
import * as fs from 'fs';

/**
 * Returns the abstract syntax tree for a given string of Q# code.
 * @param q_sharp - The code string.
 * @return The corresponding AST.
 */
function parseString(q_sharp:string) {
    const lexer = new Lexer(q_sharp, 0);
    const tokens = lexer.lex();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    return ast;
}

/**
 * Returns the abstract syntax tree for a given Q# file.
 * @param file - The file location.
 * @return The corresponding AST.
 */
exports.parse = function(file:string) {
    return parseString(fs.readFileSync(file, 'utf8'));
}

exports.parseString = parseString;
