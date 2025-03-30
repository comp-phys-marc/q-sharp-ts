import {
    AstNode,
    Paulis,
    OpenQASMCompatible,
    PossibleCompatibleScope,
    Function,
    Operation,
    Repeat,
    While,
    Condition,
    Conjugation,
    Qubit,
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
    Message
} from './ast';
import {
    BadArgumentError
} from './errors';

/** Class representing a compiler that compiles any fully OpenQASM compatible scopes in the given program into OpenQASM. 
 *  TODO: increase the number of transforms that are implemented from Q# to OpenQASM syntax! 
 */
class Compiler {
    ast:Array<AstNode>;
    qubits:Array<Qubit>;
    filePath:string;

    /**
     * Creates a compiler.
     * @param ast - Abstract syntax tree of the Q# code.
     */
    constructor(ast:Array<AstNode>, filePath:string='', qubits:Array<Qubit>) {
        this.ast = ast;
        this.filePath = filePath;
        this.qubits = qubits;
    }

    compileHelper = (ast: Array<AstNode>) => {
        let compatible = true;
        let fullQasm = '';
        for (let node of ast) {
            if (node instanceof PossibleCompatibleScope) {
                let scopeQasm = '';
                if (node instanceof Function || node instanceof Operation) {
                    let compiledFunction, compiledCompatible = this.compileHelper(node.nodes);
                    if (node instanceof Operation && node.modifiers.length > 0) {
                        compiledCompatible = false;
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
                    compatible = compiledCompatible;
                } else if (node instanceof Repeat) {
                    let compiledInside = this.compileHelper(node.inside);
                    let compiledFixup = this.compileHelper(node.fixup);
                } else if (node instanceof While) {
                    let compiledInside = this.compileHelper(node.inside);
                } else if (node instanceof Condition) {
                    let compiledIfClause = this.compileHelper(node.ifClause);
                    let compiledElseClause = this.compileHelper(node.elseClause);
                } else if (node instanceof Conjugation) {
                    let compiledWithin = this.compileHelper(node.within);
                    let compiledApplies = this.compileHelper(node.applies);
                }
            } else if (node instanceof OpenQASMCompatible) {
                // TODO: find compatible scopes and generate corresponding qasm
                if (node instanceof CCNOT) {
                    node.qasmString = `CCX ${node.first_control.name} ${node.second_control.name} ${node.target.name}\n`;
                } else if (node instanceof CNOT) {
                    node.qasmString = `CX ${node.control.name} ${node.target.name}\n`;
                } else if (node instanceof H) {
                    node.qasmString = `H ${node.target.name}\n`;
                } else if (node instanceof I) {
                    node.qasmString = `I ${node.target.name}\n`;
                } else if (node instanceof M) {
                    node.qasmString = `M ${node.target.name}\n`;
                } else if (node instanceof Measure) {
                    let qasmString = '';
                    if (node.basis.val == Paulis.PauliX) {
                        for (let qubit of node.qubits) {
                            qasmString += `H ${qubit.name}\n`;  // put each qubit in the X basis
                        }
                    } else if (node.basis.val == Paulis.PauliY) {
                        for (let qubit of node.qubits) {
                            qasmString += `SDG ${qubit.name}\n`;  // put each qubit in the Y basis
                            qasmString += `H ${qubit.name}\n`;
                        }
                    } else if (node.basis.val != Paulis.PauliZ) {
                        throw BadArgumentError;
                    }
                    for (let qubit of node.qubits) {
                        qasmString += `M ${qubit.name}\n`;
                    }
                    node.qasmString = qasmString;
                } else if (node instanceof R) {
                    if (node.pauli_axis.val == Paulis.PauliX) {
                        node.qasmString = `RX(${node.rads}) ${node.qubit}\n`;
                    } else if (node.pauli_axis.val == Paulis.PauliY) {
                        node.qasmString = `RY(${node.rads}) ${node.qubit}\n`;
                    } else if (node.pauli_axis.val == Paulis.PauliZ) {
                        node.qasmString = `RZ(${node.rads}) ${node.qubit}\n`;
                    } else if (node.pauli_axis.val == Paulis.PauliI) {
                        node.qasmString = `gphase(${-node.rads / 2.0})\n`;
                    }
                } else if (node instanceof RFrac) {
                    let angle = ((-2.0 * Math.PI) * node.numerator.val) / (2.0^node.power.val);
                    if (node.pauli.val == Paulis.PauliX) {
                        node.qasmString = `RX(${angle}) ${node.qubit}\n`;
                    } else if (node.pauli.val == Paulis.PauliY) {
                        node.qasmString = `RY(${angle}) ${node.qubit}\n`;
                    } else if (node.pauli.val == Paulis.PauliZ) {
                        node.qasmString = `RZ(${angle}) ${node.qubit}\n`;
                    } else if (node.pauli.val == Paulis.PauliI) {
                        node.qasmString = `gphase(${-angle / 2.0})\n`;
                    }
                } else if (node instanceof R1Frac) {
                    let qasmString = '';
                    let firstAngle = ((-2.0 * Math.PI) * -node.numerator.val) / (2.0^(node.power.val + 1));
                    qasmString += `RZ(${firstAngle}) ${node.qubit}\n`;
                    let secondAngle = ((-2.0 * Math.PI) * node.numerator.val) / (2.0^(node.power.val + 1));
                    qasmString += `gphase(${-secondAngle / 2.0}) ${node.qubit}\n`;
                    node.qasmString = qasmString;
                } else if (node instanceof R1) {
                    let qasmString = '';
                    qasmString += `RZ(${node.rads}) ${node.qubit}\n`;
                    qasmString += `gphase(${node.rads.val} / 2.0})\n`;
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

                }
            } else {
                compatible = false;
            }
        }
        return fullQasm, compatible;
    }

    compile = () => {
        return this.compileHelper(this.ast);
    }
}

export default Compiler;