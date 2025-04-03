import {
    AstNode,
    Paulis,
    OpenQASMCompatible,
    PossibleCompatibleScope,
    Function,
    Operation,
    Repeat,
    While,
    For,
    Condition,
    Conjugation,
    Qubit,
    CCNOT,
    CNOT,
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
    Variable,
    Arr,
    Tuple,
    AstType,
    Range,
    IntType,
    BigIntType,
    DoubleType,
    BoolType,
    QubitType,
    Use
} from './ast.js';
import {
    BadArgumentError,
    MixedTypesError,
    UnsupportedTypeError,
    UninitializedVariableError,
    BadIteratorError
} from './errors.js';

/** 
 *  Class representing a compiler that compiles any fully OpenQASM compatible scopes in the given program into OpenQASM. 
 *  TODO: increase the number of transforms that are implemented from Q# to OpenQASM syntax! 
 */
class Compiler {
    ast:Array<AstNode>;
    qubits:Array<Qubit>;
    variables:Array<Variable>;
    variableTypes:Array<AstType>;
    filePath:string;

    /**
     * Creates a compiler.
     * @param ast - Abstract syntax tree of the Q# code.
     */
    constructor(ast:Array<AstNode>, filePath:string='', qubits:Array<Qubit>, variables:Array<Variable>, variableTypes:Array<AstType>) {
        this.ast = ast;
        this.filePath = filePath;
        this.qubits = qubits;
        this.variables = variables;
        this.variableTypes = variableTypes;
    }

    compileExpr = (expr: string) => {
        return expr
            .replace('[', '{')  // arrays  TODO: does this interfere with array accesses?
            .replace(']', '}')
            .replace('..', ':')  // ranges
            .replace('^', '**')  // arithmetic operators
            .replace('~~~', '~')  // bitwise operators
            .replace('<<<', '<<')
            .replace('>>>', '>>')
            .replace('&&&', '&')
            .replace('^^^', '^')
            .replace('|||', '|')
            .replace('and', '&&')  // logical operators
            .replace('not', '!')
            .replace('or', '||');
    }

    compileHelper = (ast: Array<AstNode>) => {
        let compatible = true;
        let fullQasm = `OPENQASM 3;\nbit[${this.qubits.length}] c;\n`;
        for (let node of ast) {
            if (node instanceof PossibleCompatibleScope) {
                let scopeQasm = '';
                if (node instanceof Function || node instanceof Operation) {
                    let [compiledFunction, compiledCompatible, ast] = this.compileHelper(node.nodes);
                    if (node instanceof Operation && node.modifiers.length > 0) {
                        compiledCompatible = false; // TODO: support modifiers Ctl and Adj
                    }
                    if (compiledCompatible) {
                        scopeQasm += `def ${node.name}(`;
                        for (let param of node.params) {
                            scopeQasm += `${param.repr},`;
                        }
                        scopeQasm += `) {\n`;
                        scopeQasm += compiledFunction;
                        scopeQasm += `\n}\n`;
                        node.qasmString = scopeQasm;
                        fullQasm += scopeQasm;
                    }
                    if (compiledCompatible == false){
                        compatible = false;
                    }
                } else if (node instanceof Repeat) {
                    let [compiledInside, insideCompatible, insideAst] = this.compileHelper(node.inside);
                    let [compiledFixup, fixupCompatible, fixupAst] = this.compileHelper(node.fixup);
                    let compiledCompatible = insideCompatible && fixupCompatible;
                    scopeQasm += `while (!(${node.until.repr})) {\n`;
                    if (compiledCompatible) {
                        scopeQasm += compiledInside;
                        scopeQasm += `\n}\n`;
                    }
                    scopeQasm += compiledFixup;
                    node.qasmString = scopeQasm;
                    fullQasm += scopeQasm;
                    if (compiledCompatible == false){
                        compatible = false;
                    }
                } else if (node instanceof While) {
                    let [compiledWhile, compiledCompatible, ast] = this.compileHelper(node.inside);
                    scopeQasm += `while (${node.until.repr}) {\n`;
                    if (compiledCompatible) {
                        scopeQasm += compiledWhile;
                        scopeQasm += `\n}\n`;
                        node.qasmString = scopeQasm;
                        fullQasm += scopeQasm;
                    }
                    if (compiledCompatible == false){
                        compatible = false;
                    }
                } else if (node instanceof For) {
                    let [compiledFor, compiledCompatible, ast] = this.compileHelper(node.inside);
                    scopeQasm += 'for ';
                    if (node.vals instanceof Variable) {
                        let index = this.variables.indexOf(node.vals);
                        if (index == -1) {
                            throw UninitializedVariableError;
                        } else if (this.variableTypes[index] != Arr &&  this.variableTypes[index] != Tuple) {
                            throw BadIteratorError;
                        }
                        let ty = this.variableTypes[index];
                        if (ty == IntType) {
                            scopeQasm += 'int[64] '
                        } else if (ty == BigIntType) {
                            scopeQasm += 'int '  // QASM does not have BigInt
                        } else if (ty == DoubleType) {
                            scopeQasm += 'float '
                        } else if (ty == BoolType) {
                            scopeQasm += 'bool '
                        } else if (ty == QubitType) {
                            scopeQasm += 'qubit '
                        } else {
                            throw UnsupportedTypeError;  // TODO: support more types for iterators
                        }
                    }
                    if (node.vals instanceof Arr) {
                        // check the type is consistent
                        let ty = node.vals[0].constructor.name;
                        let max = 0;
                        if (node.vals[0] instanceof Variable) {
                            let index = this.variables.indexOf((node.vals[0] as any).name);
                            ty = this.variableTypes[index].constructor.name;
                        } else {
                            max = node.vals[0].val;
                        }
                        for (let e = 1; e < node.vals.size; e++) {
                            if (node.vals[e].constructor.name == 'Int' && (node.vals[e] as any).val > max) {
                                max = (node.vals[e] as any).val;
                            }
                            if (node.vals[e].constructor.name != ty) {
                                if (node.vals[e] instanceof Variable) {
                                    let index = this.variables.indexOf((node.vals[e] as any));
                                    if (this.variableTypes[index].constructor.name != ty) {
                                        throw MixedTypesError;
                                    }
                                } else {
                                    throw MixedTypesError;
                                }
                            }
                        }
                        if (ty == 'Int' || ty == 'BigInt') {
                            if (Math.abs(max) < 128 ) {
                                scopeQasm += 'int[8] '
                            } else if (Math.abs(max) < 32768) {
                                scopeQasm += 'int[16] '
                            } else if (Math.abs(max) < 2147483648) {
                                scopeQasm += 'int[32] '
                            } else if (Math.abs(max) < 9223372036854775808) {
                                scopeQasm += 'int[64] '
                            } else {
                                scopeQasm += 'int '  // QASM does not have BigInt
                            }
                        } else if (ty == 'Double') {
                            scopeQasm += 'float '
                        } else if (ty == 'Bool') {
                            scopeQasm += 'bool '
                        } else if (ty == 'Qubit') {
                            scopeQasm += 'qubit '
                        } else {
                            throw UnsupportedTypeError;  // TODO: support more types for iterators
                        }
                    } else if (node.vals instanceof Range) {
                        let max = node.vals.upper;
                        if (Math.abs(max.val) < 128 ) {
                            scopeQasm += 'int[8] '
                        } else if (Math.abs(max.val) < 32768) {
                            scopeQasm += 'int[16] '
                        } else if (Math.abs(max.val) < 2147483648) {
                            scopeQasm += 'int[32] '
                        } else if (Math.abs(max.val) < 9223372036854775808) {
                            scopeQasm += 'int[64] '
                        } else {
                            scopeQasm += 'int '  // QASM does not have BigInt
                        }
                    }
                    scopeQasm += `${node.variable.name} in `;

                    if (node.vals instanceof Arr) {
                        scopeQasm += `${this.compileExpr(node.vals.repr)} {\n`;
                    } else if (node.vals instanceof Range) {
                        scopeQasm += `${this.compileExpr(node.vals.repr)} {\n`;  // TODO: support ranges with different steps
                    } else if (node.vals instanceof Variable) {
                        scopeQasm += `${node.vals.name} {\n`;
                    }

                    if (compiledCompatible) {
                        scopeQasm += compiledFor;
                        scopeQasm += `\n}\n`;
                        node.qasmString = scopeQasm;
                        fullQasm += scopeQasm;
                    }
                    if (compiledCompatible == false){
                        compatible = false;
                    }
                } else if (node instanceof Condition) {
                    let [compiledIfClause, ifCompatible, ifAst] = this.compileHelper(node.ifClause);
                    let [compiledElseClause, elseCompatible, elseAst] = this.compileHelper(node.elseClause);
                    let compiledCompatible = ifCompatible && elseCompatible;
                    if (compiledCompatible) {
                        scopeQasm += `if (${this.compileExpr(node.condition.repr)}) {\n`
                        scopeQasm += compiledIfClause;
                        scopeQasm += `\n} else {\n`;
                        scopeQasm += compiledElseClause;
                        scopeQasm += '\n}'
                        node.qasmString = scopeQasm;
                        fullQasm += scopeQasm;
                    }
                    if (compiledCompatible == false){
                        compatible = false;
                    }
                } else if (node instanceof Conjugation) {
                    compatible = false;  // TODO: support conjugations
                }
            } else if (node instanceof OpenQASMCompatible) {
                // TODO: find compatible scopes and generate corresponding qasm
                if (node instanceof CCNOT) {
                    node.qasmString = `ccx ${node.first_control.name} ${node.second_control.name} ${node.target.name};\n`;
                } else if (node instanceof CNOT) {
                    node.qasmString = `cx ${node.control.name} ${node.target.name};\n`;
                } else if (node instanceof H) {
                    node.qasmString = `h ${node.target.name};\n`;
                } else if (node instanceof I) {
                    node.qasmString = `id ${node.target.name};\n`;
                } else if (node instanceof M) {
                    node.qasmString = `measure ${node.target.name} -> c[${this.qubits.indexOf(node.target)}];\n`;
                } else if (node instanceof Measure) {
                    let qasmString = '';
                    if (node.basis.val == Paulis.PauliX) {
                        for (let qubit of node.qubits) {
                            qasmString += `h ${qubit.name};\n`;  // put each qubit in the X basis
                        }
                    } else if (node.basis.val == Paulis.PauliY) {
                        for (let qubit of node.qubits) {
                            qasmString += `sdg ${qubit.name};\n`;  // put each qubit in the Y basis
                            qasmString += `h ${qubit.name};\n`;
                        }
                    } else if (node.basis.val != Paulis.PauliZ) {
                        throw BadArgumentError;
                    }
                    for (let qubit of node.qubits) {
                        qasmString += `measure ${qubit.name} -> c[${this.qubits.indexOf(qubit)}];\n`;
                    }
                    node.qasmString = qasmString;
                } else if (node instanceof R) {
                    if (node.pauli_axis.val == Paulis.PauliX) {
                        node.qasmString = `rx(${node.rads}) ${node.qubit};\n`;
                    } else if (node.pauli_axis.val == Paulis.PauliY) {
                        node.qasmString = `ry(${node.rads}) ${node.qubit};\n`;
                    } else if (node.pauli_axis.val == Paulis.PauliZ) {
                        node.qasmString = `rz(${node.rads}) ${node.qubit};\n`;
                    } else if (node.pauli_axis.val == Paulis.PauliI) {
                        node.qasmString = `gphase(${-node.rads / 2.0});\n`;
                    }
                } else if (node instanceof RFrac) {
                    let angle = ((-2.0 * Math.PI) * node.numerator.val) / (2.0^node.power.val);
                    if (node.pauli.val == Paulis.PauliX) {
                        node.qasmString = `rx(${angle}) ${node.qubit};\n`;
                    } else if (node.pauli.val == Paulis.PauliY) {
                        node.qasmString = `ry(${angle}) ${node.qubit};\n`;
                    } else if (node.pauli.val == Paulis.PauliZ) {
                        node.qasmString = `rz(${angle}) ${node.qubit};\n`;
                    } else if (node.pauli.val == Paulis.PauliI) {
                        node.qasmString = `gphase(${-angle / 2.0});\n`;
                    }
                } else if (node instanceof R1Frac) {
                    let qasmString = '';
                    let firstAngle = ((-2.0 * Math.PI) * -node.numerator.val) / (2.0^(node.power.val + 1));
                    qasmString += `rz(${firstAngle}) ${node.qubit};\n`;
                    let secondAngle = ((-2.0 * Math.PI) * node.numerator.val) / (2.0^(node.power.val + 1));
                    qasmString += `gphase(${-secondAngle / 2.0}) ${node.qubit};\n`;
                    node.qasmString = qasmString;
                } else if (node instanceof R1) {
                    let qasmString = '';
                    qasmString += `rz(${node.rads}) ${node.qubit};\n`;
                    qasmString += `gphase(${node.rads.val} / 2.0});\n`;
                    node.qasmString = qasmString;
                } else if (node instanceof Reset) {
                    node.qasmString = `reset ${node.target}`;
                } else if (node instanceof ResetAll) {
                    let qasmString = '';
                    for (let qubit of this.qubits) {
                        qasmString += `reset ${qubit}`;
                    }
                    node.qasmString = qasmString;
                } else if (node instanceof Rx) {
                    node.qasmString = `rx(${node.rads}) ${node.qubit};\n`;
                } else if (node instanceof Ry) {
                    node.qasmString = `ry(${node.rads}) ${node.qubit};\n`;
                } else if (node instanceof Rz) {
                    node.qasmString = `rz(${node.rads}) ${node.qubit};\n`;
                } else if (node instanceof Rxx) {
                    node.qasmString = `u3(pi/2, ${node.rads}, 0) ${node.qubit0};\nh ${node.qubit1};\ncx ${node.qubit0},${node.qubit1};\nu1(-${node.rads}) ${node.qubit1};\ncx ${node.qubit0},${node.qubit1};\nh ${node.qubit1};\nu2(-pi, pi-${node.rads}) ${node.qubit0};\n`;
                } else if (node instanceof Ryy) {
                    node.qasmString = `cy ${node.qubit0},${node.qubit1};ry(${node.rads}) ${node.qubit0};cy ${node.qubit0},${node.qubit1};\n`
                } else if (node instanceof Rzz) {
                    node.qasmString = `cx ${node.qubit0},${node.qubit1};\nu1(${node.rads}) ${node.qubit1};\ncx ${node.qubit0},${node.qubit1};\n`;
                } else if (node instanceof S) {
                    node.qasmString = `s ${node.target};\n`;
                } else if (node instanceof SWAP) {
                    node.qasmString = `swap ${node.qubit0},${node.qubit1};\n`;
                } else if (node instanceof T) {
                    node.qasmString = `t ${node.target.name};\n`;
                } else if (node instanceof X) {
                    node.qasmString = `x ${node.target.name};\n`;
                } else if (node instanceof Y) {
                    node.qasmString = `y ${node.target.name};\n`;
                } else if (node instanceof Z) {
                    node.qasmString = `z ${node.target.name};\n`;
                } else if (node instanceof Use) {
                    if (node.qubits.length.val == 1) {
                        node.qasmString = `qubit ${node.qubits[0].name}`;
                    } else {
                        node.qasmString = `qubit[${node.qubits.length}] ${node.name}`;
                    }
                }
                fullQasm += node.qasmString;
            } else {
                compatible = false;
            }
        }
        return [fullQasm, compatible, ast];
    }

    compile = () => {
        return this.compileHelper(this.ast);
    }
}

export default Compiler;
