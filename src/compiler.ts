import {
    AstNode
} from './ast';

/** Class representing a compiler that compiles any fully OpenQASM compatible scopes in the given program into OpenQASM. 
 *  TODO: increase the number of transforms that are implemented from Q# to OpenQASM syntax! 
 */
class Compiler {
    ast:Array<AstNode>;
    filePath:string;

    /**
     * Creates a compiler.
     * @param ast - Abstract syntax tree of the Q# code.
     */
    constructor(ast:Array<AstNode>, filePath:string='') {
        this.ast = ast;
        this.filePath = filePath;
    }
}