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

parseString(`
operation ReflectAboutMarked(inputQubits : Qubit[]) : Unit {
  use outputQubit = Qubit();
  within {
    // We initialize the outputQubit to (|0> = |1>) / sqrt(2), so that
    // toggling it results in a (=1) phase.
    X(outputQubit);
    H(outputQubit);
    // Flip the outputQubit for marked states.
    // Here, we get the state with alternating 0s and 1s by using the X
    // operation on every other qubit.
    for q in inputQubits [...2...] {
      X(q);
    }
  } apply {
    Controlled X(inputQubits, outputQubit);
  }
}`);