import { BadArgumentError } from "./errors.js";
import { inverseParamLookup, Token } from "./token.js";
import { Complex } from './complex.js';

/** Base class representing a basic AST node. */
class AstNode {}

/** Base class representing a type. */
class AstType extends AstNode{}

/** Base class representing an OpenQASM compatible operation. */
class OpenQASMCompatible extends AstNode {
    qasmString:string;
}

/** Base class representing a scope that may be composed of OpenQASM compatible operations. */
class PossibleCompatibleScope extends AstNode {
    qasmString:string;
}

/** Class representing an OpenQASM compatible AND operation. */
class AND extends OpenQASMCompatible {
    constructor() {
        super();
    }
}

/** Class representing an OpenQASM compatible CCNOT operation. */
class CCNOT extends OpenQASMCompatible {
    first_control: Qubit;
    second_control: Qubit;
    target: Qubit;
    constructor(first_control: Qubit, second_control: Qubit, target: Qubit) {
        super();
        this.first_control = first_control;
        this.second_control = second_control;
        this.target = target;
    }
}

/** Class representing an OpenQASM compatible CNOT operation. */
class CNOT extends OpenQASMCompatible {
    control: Qubit;
    target: Qubit;
    constructor(control: Qubit, target: Qubit) {
        super();
        this.control = control;
        this.target = target;
    }
}

/** Class representing an OpenQASM compatible CZ operation. */
class CZ extends OpenQASMCompatible {
    control: Qubit;
    target: Qubit;
    constructor(control: Qubit, target: Qubit) {
        super();
        this.control = control;
        this.target = target;
    }
}

/** Class representing an Exp operation. */
class Ex extends AstNode {
    constructor() {
        super();
    }
}

/** Class representing an OpenQASM compatible H operation. */
class H extends OpenQASMCompatible {
    target: Qubit;
    constructor(target: Qubit) {
        super();
        this.target = target;
    }
}

/** Class representing an OpenQASM compatible I operation. */
class I extends OpenQASMCompatible {
    target: Qubit;
    constructor(target: Qubit) {
        super();
        this.target = target;
    }
}

/** Class representing an OpenQASM compatible M operation. */
class M extends OpenQASMCompatible {
    target: Qubit;
    constructor(target: Qubit) {
        super();
        this.target = target;
    }
}

/** Class representing an OpenQASM compatible Measure operation. */
class Measure extends OpenQASMCompatible {
    basis: Pauli;
    qubits: Array<Qubit>;
    constructor(basis: Pauli, qubits: Array<Qubit>) {
        super();
        this.basis = basis;
        this.qubits = qubits;
    }
}

/** Class representing an OpenQASM compatible R operation. */
class R extends OpenQASMCompatible {
    pauli_axis: Pauli;
    rads: Double;
    qubit: Qubit;
    constructor(pauli_axis:Pauli, rads:Double, qubit:Qubit) {
        super();
        this.pauli_axis = pauli_axis;
        this.rads = rads;
        this.qubit = qubit;
    }
}

/** Class representing an R1 operation. */
class R1 extends OpenQASMCompatible {
    rads: Double;
    qubit: Qubit;
    constructor(rads: Double, qubit: Qubit) {
        super();
        this.rads = rads;
        this.qubit = qubit;
    }
}

/** Class representing an OpenQASM compatible R1Frac operation. */
class R1Frac extends OpenQASMCompatible {
    numerator: Int;
    power: Int;
    qubit: Qubit;
    constructor(numerator: Int, power: Int, qubit: Qubit) {
        super();
        this.numerator = numerator;
        this.power = power;
        this.qubit = qubit;
    }
}

/** Class representing an OpenQASM compatible Reset operation. */
class Reset extends OpenQASMCompatible {
    target: Qubit;
    constructor(target: Qubit) {
        super();
        this.target = target;
    }
}

/** Class representing an OpenQASM compatible ResetAll operation. */
class ResetAll extends OpenQASMCompatible {
    target: Qubit;
    constructor(target: Qubit) {
        super();
        this.target = target;
    }
}

/** Class representing an OpenQASM compatible RFrac operation. */
class RFrac extends OpenQASMCompatible {
    pauli: Pauli;
    numerator: Int;
    power: Int;
    qubit: Qubit;
    constructor(pauli: Pauli, numerator: Int, power: Int, qubit: Qubit) {
        super();
        this.pauli = pauli;
        this.numerator = numerator;
        this.power = power;
        this.qubit = qubit;
    }
}

/** Class representing an OpenQASM compatible Rx operation. */
class Rx extends OpenQASMCompatible {
    rads: Double;
    qubit: Qubit;
    constructor(rads: Double, qubit: Qubit) {
        super();
        this.rads = rads;
        this.qubit = qubit;
    }
}

/** Class representing an OpenQASM compatible Rxx operation. */
class Rxx extends OpenQASMCompatible {
    rads: Double;
    qubit0: Qubit;
    qubit1: Qubit;
    constructor(rads: Double, qubit0: Qubit, qubit1: Qubit) {
        super();
        this.rads = rads;
        this.qubit0 = qubit0;
        this.qubit1 = qubit1;
    }
}

/** Class representing an OpenQASM compatible Ry operation. */
class Ry extends OpenQASMCompatible {
    rads: Double;
    qubit: Qubit;
    constructor(rads: Double, qubit: Qubit) {
        super();
        this.rads = rads;
        this.qubit = qubit;
    }
}

/** Class representing an OpenQASM compatible Ryy operation. */
class Ryy extends OpenQASMCompatible {
    rads: Double;
    qubit0: Qubit;
    qubit1: Qubit;
    constructor(rads: Double, qubit0: Qubit, qubit1: Qubit) {
        super();
        this.rads = rads;
        this.qubit0 = qubit0;
        this.qubit1 = qubit1;
    }
}

/** Class representing an OpenQASM compatible Rz operation. */
class Rz extends OpenQASMCompatible {
    rads: Double;
    qubit: Qubit;
    constructor(rads: Double, qubit: Qubit) {
        super();
        this.rads = rads;
        this.qubit = qubit;
    }
}

/** Class representing an OpenQASM compatible Rzz operation. */
class Rzz extends OpenQASMCompatible {
    rads: Double;
    qubit0: Qubit;
    qubit1: Qubit;
    constructor(rads: Double, qubit0: Qubit, qubit1: Qubit) {
        super();
        this.rads = rads;
        this.qubit0 = qubit0;
        this.qubit1 = qubit1;
    }
}

/** Class representing an OpenQASM compatible S operation. */
class S extends OpenQASMCompatible {
    target: Qubit;
    constructor(target: Qubit) {
        super();
        this.target = target;
    }
}

/** Class representing an OpenQASM compatible SWAP operation. */
class SWAP extends OpenQASMCompatible {
    qubit0: Qubit;
    qubit1: Qubit;
    constructor(qubit0: Qubit, qubit1: Qubit) {
        super();
        this.qubit0 = qubit0;
        this.qubit1 = qubit1;
    }
}

/** Class representing an OpenQASM compatible T operation. */
class T extends OpenQASMCompatible {
    target: Qubit;
    constructor(target: Qubit) {
        super();
        this.target = target;
    }
}

/** Class representing an OpenQASM compatible X operation. */
class X extends OpenQASMCompatible {
    target: Qubit;
    constructor(target: Qubit) {
        super();
        this.target = target;
    }
}

/** Class representing an OpenQASM compatible Y operation. */
class Y extends OpenQASMCompatible {
    target: Qubit;
    constructor(target: Qubit) {
        super();
        this.target = target;
    }
}

/** Class representing an OpenQASM compatible Z operation. */
class Z extends OpenQASMCompatible {
    target: Qubit;
    constructor(target: Qubit) {
        super();
        this.target = target;
    }
}

/** Class representing an OpenQASM compatible ApplyUnitary operation. */
class ApplyUnitary extends AstNode {
    unitary: Array<Array<Complex>>;
    qubits: Array<Qubit>;
    constructor(unitary: Array<Array<Complex>>, qubits:Array<Qubit>) {
        super();
        this.unitary = unitary;
        this.qubits = qubits;
    }
}

/** Class representing an OpenQASM compatible Meassage operation. */
class Message extends AstNode {
    constructor() {
        super();
    }
}

/** Class representing a use statement. */
class Use extends OpenQASMCompatible {
    qubits:Qubit;
    name: Str;
    constructor(name: Str, qubits:Qubit) {
        super();
        this.name = name;
        this.qubits = qubits;
    }
}

/** Class representing a borrow statement. */
class Borrow extends AstNode {
    qubits:Qubit;
    name: Str;
    constructor(name: Str, qubits:Qubit) {
        super();
        this.name = name;
        this.qubits = qubits;
    }
}

/** Class representing an import. */
class Import extends AstNode {
    val:Variable | GetParam | Id;
    constructor(val:Variable | GetParam | Id) {
        super();
        this.val = val;
    }
}

/** Base class representing a basic parameter. */
class Parameter extends AstNode {
    repr:string;
    constructor(repr:string) {
        super();
        this.repr = repr;
    }
}

/** Class representing an identifier. */
class Id extends Parameter {
    id:string;
    constructor(id:string) {
        super(id);
        this.id = id;
    }
}

/** Class representing an array. */
class Arr extends Parameter {
    vals:Array<Parameter>;
    size:number;
    constructor(vals:Array<Parameter>, size:number) {
        let repr = '['
        for (let param of vals) {
            repr += `${param.repr},`
        }
        repr += ']';
        super(repr);
        this.vals = vals;
        this.size = size;
    }
}

/** Class representing a tuple. */
class Tuple extends Parameter {
    vals:Array<Parameter>;
    size:Int;
    constructor(vals:Array<Parameter>, size:Int) {
        let repr = '('
        for (let param of vals) {
            repr += `${param.repr},`
        }
        repr += ')';
        super(repr);
        this.vals = vals;
        this.size = size;
    }
}

/** Class representing a struct. */
class Struct extends Parameter {
    vals:Array<Parameter>;
    names:Array<Id>;
    constructor(vals:Array<Parameter>, names:Array<Id>) {
        let repr = '{'
        for (let i = 0; i < vals.length; i++) {
            repr += `${names[i]}: ${vals[i].repr},`
        }
        repr += '}';
        super(repr);
        this.vals = vals;
        this.names = names;
    }
}

/** Class representing a function. */
class Function extends PossibleCompatibleScope {
    name:string;
    nodes:Array<AstNode>;
    params:Array<Array<Parameter>>;
    returnType:AstType;
    constructor(name:string, nodes:Array<AstNode>, params:Array<Array<Parameter>>, returnType:AstType) {
        super();
        this.name = name;
        this.nodes = nodes;
        this.params = params;
        this.returnType = returnType;
    }
}

/** Operation modifiers. */
enum Modifier {
    Adjoint,
    Controlled
}

/** Class representing a operator modifier. */
class Adjoint extends AstNode {}

/** Class representing a operator modifier. */
class Controlled extends AstNode {}

/** Class representing an operation. */
class Operation extends PossibleCompatibleScope {
    name:string;
    nodes:Array<AstNode>;
    params:Array<Array<Parameter>>;
    modifiers:Array<Modifier>;
    returnType:AstType;
    constructor(name:string, nodes:Array<AstNode>, params:Array<Array<Parameter>>, modifiers:Array<Modifier>, returnType:AstType) {
        super();
        this.name = name;
        this.nodes = nodes;
        this.params = params;
        this.modifiers = modifiers;
        this.returnType = returnType;
    }
}

/** Class representing a float. */
class Double extends Parameter {
    val:Expression | number;
    constructor(val:Expression | number) {
        if (!(val instanceof Expression)) {
            super(val.toString());
        } else {
            super(val.repr);
        }
        this.val = val;
    }
}

/** Class representing an integer. */
class BigInt extends Parameter {
    val:Expression | number;
    constructor(val:Expression | number) {
        if (!(val instanceof Expression)) {
            super(val.toString());
        } else {
            super(val.repr);
        }
        this.val = val;
    }
}

/** Class representing a unit. */
class Unit extends Parameter {
    constructor() {
        super('()');
    }
}

/** Class representing a string. */
class Str extends Parameter {
    val:string;
    constructor(val:string) {
        super(val);
        this.val = val;
    }
}

/** Class representing a comment. */
class Comment extends OpenQASMCompatible {
    val:string;
    constructor(val:string) {
        super();
        this.val = val;
    }
}

/** Class representing an iterator. */
class For extends PossibleCompatibleScope {
    inside:Array<AstNode>;
    variable:Variable;
    vals:Arr | Range | Variable;
    constructor(inside:Array<AstNode>, vals:Array<Int | Variable> | Range | Variable, variable:Variable) {
        super();
        this.variable = variable;
        this.inside = inside;
        if (vals instanceof Array) {
            this.vals = new Arr(vals, vals.length);
        } else {
            this.vals = vals;
        }
    }
}

/** Class representing an iterator. */
class Repeat extends PossibleCompatibleScope {
    inside:Array<AstNode>;
    until:Expression;
    fixup:Array<AstNode>;
    constructor(inside:Array<AstNode>, until:Expression, fixup:Array<AstNode>) {
        super();
        this.inside = inside;
        this.until = until;
        this.fixup = fixup;
    }
}

/** Class representing an iterator. */
class While extends PossibleCompatibleScope {
    inside:Array<AstNode>;
    until:Expression;
    constructor(inside:Array<AstNode>, until:Expression) {
        super();
        this.inside = inside;
        this.until = until;
    }
}

/** Class representing a range. */
class Range extends Parameter {
    lower:Expression | Continue;
    upper:Expression | Continue;
    step:Expression;
    constructor(lower:Expression | Continue, upper:Expression | Continue, step?:Expression) {
        let repr = '';
        if (step == undefined && !(lower instanceof Continue) && !(upper instanceof Continue)) {
            repr = `${lower.repr}..${upper.repr}`;
        } else if (step != undefined && !(lower instanceof Continue) && !(upper instanceof Continue)) {
            repr = `${lower.repr}..${step.repr}..${upper.repr}`;
        } else if ((lower instanceof Continue) && (step != undefined) && !(upper instanceof Continue)) {
            repr = `...${step.repr}..${upper.repr}`;
        } else if (!(lower instanceof Continue) && (step != undefined) && (upper instanceof Continue)) {
            repr = `${lower.repr}..${step.repr}...`;
        } else if ((lower instanceof Continue) && (step == undefined) && !(upper instanceof Continue)) {
            repr = `...${upper.repr}`;
        } else if (!(lower instanceof Continue) && (step == undefined) && (upper instanceof Continue)) {
            repr = `${lower.repr}...`;
        } else if ((lower instanceof Continue) && (upper instanceof Continue) && (step != undefined)) {
            repr = `...${step.repr}...`;
        } else if ((lower instanceof Continue) && (upper instanceof Continue) && (step == undefined)) {
            repr = '...1...';
        }
        super(repr);
        this.lower = lower;
        this.upper = upper;
    }
}

/** Class representing a continuation. */
class Continue extends AstNode {
    constructor() {
        super();
    }
}

/** Class representing an integer. */
class Int extends Parameter {
    val:number;
    constructor(val:number) {
        super(val.toString());
        this.val = val;
    }
}

/** Class representing a boolean. */
class Bool extends Parameter {
    val:boolean;
    constructor(val:boolean) {
        super(val.toString());
        this.val = val;
    }
}

/** Class representing a qubit. */
class Qubit extends Parameter {
    name:string;
    length:Parameter;
    constructor(name:string, length?:Parameter) {
        super(name);
        this.name = name;
        if (typeof length !== 'undefined') {
            this.length = length;
        } else {
            this.length = new Int(1);
        }
    }
}

/** Class representing a result. */
class Result extends Parameter {
    val:boolean;
    constructor(val:boolean) {
        super(val.toString());
        this.val = val;
    }
}

/** Class representing a Unit type. */
class UnitType extends AstType {}

/** Class representing an Int type. */
class IntType extends AstType {}

/** Class representing a BigInt type. */
class BigIntType extends AstType {}

/** Class representing a Double type. */
class DoubleType extends AstType {}

/** Class representing a Bool type. */
class BoolType extends AstType {}

/** Class representing a String type. */
class StringType extends AstType {}

/** Class representing a Qubit type. */
class QubitType extends AstType {}

/** Class representing a Result type. */
class ResultType extends AstType {}

/** Class representing a Pauli type. */
class PauliType extends AstType {}

/** Class representing a Range type. */
class RangeType extends AstType {}

/** Class representing an Array type. */
class ArrayType extends AstType {}

/** Class representing a Tuple type. */
class TupleType extends AstType {}

/** Class representing a struct type. */
class StructType extends AstType {}

/** Class representing an Operation type. */
class OperationType extends AstType {}

/** Class representing a Function type. */
class FunctionType extends AstType {}

/** Pauli basis */
enum Paulis {
    PauliX,
    PauliY,
    PauliZ,
    PauliI
}

/** Class representing a result. */
class Pauli extends Parameter {
    val:Paulis;
    constructor(val:Paulis) {
        if (val == Paulis.PauliI) {
            super('PauliI');
        } else if (val == Paulis.PauliX) {
            super('PauliX');
        } else if (val == Paulis.PauliY) {
            super('PauliY');
        } else if (val == Paulis.PauliZ) {
            super('PauliZ');
        } else {
            throw BadArgumentError;
        }
        this.val = val;
    }
}

/** Class representing a variable. */
class Variable extends Parameter {
    name:string;
    constructor(name:string) {
        super(name);
        this.name = name;
    }
}

/** Class representing a parameter assignment. */
class IndexedSet extends AstNode {
    name:string;
    index:Range | Int;
    val:AstNode;
    constructor(name:string, index:Range | Int, val:AstNode) {
        super();
        this.index = index;
        this.name = name;
        this.val = val;
    }
}

/** Class representing a parameter assignment. */
class SetParam extends AstNode {
    instance:string;
    val:AstNode;
    constructor(instance:string, val:AstNode) {
        super();
        this.instance = instance;
        this.val = val;
    }
}

/** Class representing a parameter reference. */
class GetParam extends Parameter {
    instance:string;
    index:Expression|Range;
    constructor(instance:string, index:Expression|Range) {
        super(`${instance}[${index.repr}]`);
        this.instance = instance;
        this.index = index;
    }
}

/** Class representing a condition. */
class Condition extends PossibleCompatibleScope {
    condition:Expression;
    ifClause:Array<AstNode>;
    elseClause:Array<AstNode>;
    constructor(condition:Expression, ifClause:Array<AstNode>, elseClause?:Array<AstNode>) {
        super();
        this.condition = condition;
        this.ifClause = ifClause;
        this.elseClause = elseClause;
    }
}

/** Class representing exponential. */
class Exp extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Ex));
    }
}

/** Class representing minus. */
class Minus extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Minus));
    }
}

/** Class representing a union. */
class Or extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Or));
    }
}

/** Class representing an intersection. */
class And extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.And));
    }
}

/** Class representing an inversion. */
class Not extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Not));
    }
}

/** Class representing plus. */
class Plus extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Plus));
    }
}

/** Class representing times. */
class Times extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Times));
    }
}

/** Class representing divide. */
class Divide extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Divide));
    }
}

/** Class representing less than. */
class Less extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Less));
    }
}

/** Class representing bitwise or. */
class BitwiseOr extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.BitwiseOr));
    }
}

/** Class representing bitwise and. */
class BitwiseAnd extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.BitwiseAnd));
    }
}

/** Class representing bitwise not. */
class BitwiseNot extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.BitwiseNot));
    }
}

/** Class representing bitwise xor. */
class BitwiseXor extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.BitwiseXor));
    }
}

/** Class representing greater than. */
class More extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.More));
    }
}

/** Class representing left angle bracket. */
class Left extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Left));
    }
}

/** Class representing right angle bracket. */
class Right extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Right));
    }
}

/** Class representing modulus. */
class Mod extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Mod));
    }
}

/** Class representing an unwrap. */
class Unwrap extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Unwrap));
    }
}

/** Class representing equality. */
class Eq extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Eq));
    }
}

/** Class representing plus equals. */
class Peq extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Peq));
    }
}

/** Class representing minus equals. */
class Meq extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Meq));
    }
}

/** Class representing not equals. */
class Neq extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Neq));
    }
}

/** Class representing dummy variable. */
class Dummy extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Dummy));
    }
}

/** Class representing greater than or equal to. */
class Geq extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Geq));
    }
}

/** Class representing less than or equal to. */
class Leq extends Parameter {
    constructor() {
        super(inverseParamLookup(Token.Leq));
    }
}

/** Class representing an is keyword. */
class Is extends AstNode {}

/** Class representing assignment. */
class Let extends AstNode {
    expression:Expression;
    variable:Variable;
    constructor(expression:Expression, variable:Variable) {
        super();
        this.expression = expression;
        this.variable = variable;
    }
}

/** Class representing a conjugation. */
class Conjugation extends PossibleCompatibleScope {
    within:Array<AstNode>;
    applies:Array<AstNode>;
    constructor(within:Array<AstNode>, applies:Array<AstNode>) {
        super();
        this.within = within;
        this.applies = applies;
    }
}

/** Class representing mutable assignment. */
class Mutable extends AstNode {
    expression:Expression;
    variable:Variable;
    constructor(expression:Expression, variable:Variable) {
        super();
        this.expression = expression;
        this.variable = variable;
    }
}

/** Class representing expression. */
class Expression extends Parameter {
    elements:Array<Parameter>;
    constructor(elements:Array<Parameter>) {
        let repr = '';
        for (let elem of elements) {
            repr += elem.repr;
        }
        super(repr);
        this.elements = elements;
    }
}

/** A program termination. */
class Fail extends AstNode {
    msg:Str;
    constructor(msg:Str) {
        super();
        this.msg = msg;
    }
}

/** A return statement. */
class Return extends AstNode {
    expr:Expression;
    constructor(expr:Expression) {
        super();
        this.expr = expr;
    }
}

/** Class representing an operator application. */
class ApplyOperator extends Parameter {
    name:string;
    registers:Array<Qubit>;
    params:Array<Array<Parameter>>;
    // TODO: add modifiers
    constructor(name:string, params:Array<Array<Parameter>>, registers?:Array<Qubit>) {
        let paramRepr = '';
        for (let p of params) {
            for (let elem of p) {
                paramRepr += elem.repr;
            }
            paramRepr += ', ';
        }
        if (registers != undefined) {
            let regRepr = '';
            for (let reg of registers) {
                regRepr += reg.name;
                regRepr += ',';
            }
            super(`${name}(${paramRepr}) ${regRepr}`);
        } else {
            super(`${name}(${paramRepr})`);
        }
        this.name = name;
        this.registers = registers;
        this.params = params;
    }
}

export {
    AstNode,
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
    Is,
    OpenQASMCompatible,
    PossibleCompatibleScope,
    AND,
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
    CZ,
    ApplyUnitary,
    Message,
    UnitType,
    IntType,
    BigIntType,
    DoubleType,
    BoolType,
    StringType,
    QubitType,
    ResultType,
    PauliType,
    RangeType,
    ArrayType,
    TupleType,
    StructType,
    OperationType,
    FunctionType,
    AstType,
    IndexedSet,
    GetParam,
    Comment,
    ApplyOperator,
    Continue,
    Adjoint,
    Controlled
};
