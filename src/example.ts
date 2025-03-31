import Lexer from './lexer';
import Parser from './parser';
import Compiler from './compiler';
import * as fs from 'fs';

const q_sharp = fs.readFileSync('spec/q-sharp/sample.qs', 'utf8');

console.log(q_sharp);

const lexer = new Lexer(q_sharp, 0);
const tokens = lexer.lex();

console.log(tokens);

const parser = new Parser(tokens, false, 'spec/q-sharp/');
const ast = parser.parse();

for (let i=0; i<ast.length; i++) {
    console.log(ast[i]);
    if (ast[i]['val'] && ast[i]['val']['elements']) {
        for (let j=0; j<ast[i]['val']['elements'].length; j++) {
            console.log(ast[i]['val']['elements'][j]);
        }
    }
    console.log(JSON.stringify(ast[i]));
    console.log('\n');
}

const compiler = new Compiler(ast, 'spec/q-sharp/', parser.qubits, parser.variables, parser.variableTypes);
const [qasm, compatible, qasmAst] = compiler.compile();

console.log(qasm);