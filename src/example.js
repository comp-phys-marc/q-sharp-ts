import Lexer from './lexer.js';
import Parser from './parser.js';
import Compiler from './compiler.js';
import * as fs from 'fs';
const q_sharp = fs.readFileSync('/Users/marcusedwards/Documents/School/Courses/CMPT_981/final-project/code/spec/q-sharp/bell-states.qs', 'utf8');
console.log(q_sharp);
const lexer = new Lexer(q_sharp, 0);
const tokens = lexer.lex();
for (let i = 0; i < tokens.length; i++) {
    console.log(tokens[i]);
}
const parser = new Parser(tokens, false, '/Users/marcusedwards/Documents/School/Courses/CMPT_981/final-project/code/spec/q-sharp/');
const ast = parser.parse();
for (let i = 0; i < ast.length; i++) {
    console.log(ast[i]);
    if (ast[i]['val'] && ast[i]['val']['elements']) {
        for (let j = 0; j < ast[i]['val']['elements'].length; j++) {
            console.log(ast[i]['val']['elements'][j]);
        }
    }
    console.log(JSON.stringify(ast[i]));
    console.log('\n');
}
const compiler = new Compiler(ast, '../spec/q-sharp/', parser.qubits, parser.variables, parser.variableTypes);
const [qasm, compatible, qasmAst] = compiler.compile();
console.log(qasm);
//# sourceMappingURL=example.js.map