import Lexer from './lexer.js';
import Parser from './parser.js';
import Compiler from './compiler.js';
import * as fs from 'fs';
// Replace me!
const baseDir = '/Users/marcusedwards/Documents/School/Courses/CMPT_981/final-project/code';
// Try a few scripts!
// const q_sharp = fs.readFileSync(baseDir + '/spec/q-sharp/demo.qs', 'utf8');  // Fully parses and compiles...
// const q_sharp = fs.readFileSync(baseDir + '/spec/q-sharp/bell-states.qs', 'utf8');  // Fully parses and partially compiles...
const q_sharp = fs.readFileSync(baseDir + '/spec/q-sharp/grover.qs', 'utf8'); // Fully parses and partially compiles...
console.log(q_sharp);
const lexer = new Lexer(q_sharp, 0);
const tokens = lexer.lex();
for (let i = 0; i < tokens.length; i++) {
    console.log(tokens[i]);
}
const parser = new Parser(tokens, false, baseDir + '/spec/q-sharp/');
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
if (!compatible) {
    console.log('WARNING! The Q# code is not fully supported by the compiler. All compatible scopes have been compiled.');
}
console.log(qasm);
// Output the compiled QASM!
// fs.writeFile(baseDir + '/spec/qasm/demo.qasm', qasm, () => {});
// fs.writeFile(baseDir + '/spec/qasm/bell-states.qasm', qasm, () => {});
fs.writeFile(baseDir + '/spec/qasm/grover.qasm', qasm, () => { });
//# sourceMappingURL=example.js.map