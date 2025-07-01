import { BadArgumentError } from "./errors.js";
import { inverseParamLookup, Token } from "./token.js";
/** Base class representing a basic AST node. */
class AstNode {
}
/** Base class representing a type. */
class AstType extends AstNode {
}
/** Base class representing an OpenQASM compatible operation. */
class OpenQASMCompatible extends AstNode {
}
/** Base class representing a scope that may be composed of OpenQASM compatible operations. */
class PossibleCompatibleScope extends AstNode {
}
/** Class representing an OpenQASM compatible AND operation. */
class AND extends OpenQASMCompatible {
    constructor() {
        super();
    }
}
/** Class representing an OpenQASM compatible CCNOT operation. */
class CCNOT extends OpenQASMCompatible {
    constructor(first_control, second_control, target) {
        super();
        this.first_control = first_control;
        this.second_control = second_control;
        this.target = target;
    }
}
/** Class representing an OpenQASM compatible CNOT operation. */
class CNOT extends OpenQASMCompatible {
    constructor(control, target) {
        super();
        this.control = control;
        this.target = target;
    }
}
/** Class representing an OpenQASM compatible CZ operation. */
class CZ extends OpenQASMCompatible {
    constructor(control, target) {
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
    constructor(target) {
        super();
        this.target = target;
    }
}
/** Class representing an OpenQASM compatible I operation. */
class I extends OpenQASMCompatible {
    constructor(target) {
        super();
        this.target = target;
    }
}
/** Class representing an OpenQASM compatible M operation. */
class M extends OpenQASMCompatible {
    constructor(target) {
        super();
        this.target = target;
    }
}
/** Class representing an OpenQASM compatible Measure operation. */
class Measure extends OpenQASMCompatible {
    constructor(basis, qubits) {
        super();
        this.basis = basis;
        this.qubits = qubits;
    }
}
/** Class representing an OpenQASM compatible R operation. */
class R extends OpenQASMCompatible {
    constructor(pauli_axis, rads, qubit) {
        super();
        this.pauli_axis = pauli_axis;
        this.rads = rads;
        this.qubit = qubit;
    }
}
/** Class representing an R1 operation. */
class R1 extends OpenQASMCompatible {
    constructor(rads, qubit) {
        super();
        this.rads = rads;
        this.qubit = qubit;
    }
}
/** Class representing an OpenQASM compatible R1Frac operation. */
class R1Frac extends OpenQASMCompatible {
    constructor(numerator, power, qubit) {
        super();
        this.numerator = numerator;
        this.power = power;
        this.qubit = qubit;
    }
}
/** Class representing an OpenQASM compatible Reset operation. */
class Reset extends OpenQASMCompatible {
    constructor(target) {
        super();
        this.target = target;
    }
}
/** Class representing an OpenQASM compatible ResetAll operation. */
class ResetAll extends OpenQASMCompatible {
    constructor(target) {
        super();
        this.target = target;
    }
}
/** Class representing an OpenQASM compatible RFrac operation. */
class RFrac extends OpenQASMCompatible {
    constructor(pauli, numerator, power, qubit) {
        super();
        this.pauli = pauli;
        this.numerator = numerator;
        this.power = power;
        this.qubit = qubit;
    }
}
/** Class representing an OpenQASM compatible Rx operation. */
class Rx extends OpenQASMCompatible {
    constructor(rads, qubit) {
        super();
        this.rads = rads;
        this.qubit = qubit;
    }
}
/** Class representing an OpenQASM compatible Rxx operation. */
class Rxx extends OpenQASMCompatible {
    constructor(rads, qubit0, qubit1) {
        super();
        this.rads = rads;
        this.qubit0 = qubit0;
        this.qubit1 = qubit1;
    }
}
/** Class representing an OpenQASM compatible Ry operation. */
class Ry extends OpenQASMCompatible {
    constructor(rads, qubit) {
        super();
        this.rads = rads;
        this.qubit = qubit;
    }
}
/** Class representing an OpenQASM compatible Ryy operation. */
class Ryy extends OpenQASMCompatible {
    constructor(rads, qubit0, qubit1) {
        super();
        this.rads = rads;
        this.qubit0 = qubit0;
        this.qubit1 = qubit1;
    }
}
/** Class representing an OpenQASM compatible Rz operation. */
class Rz extends OpenQASMCompatible {
    constructor(rads, qubit) {
        super();
        this.rads = rads;
        this.qubit = qubit;
    }
}
/** Class representing an OpenQASM compatible Rzz operation. */
class Rzz extends OpenQASMCompatible {
    constructor(rads, qubit0, qubit1) {
        super();
        this.rads = rads;
        this.qubit0 = qubit0;
        this.qubit1 = qubit1;
    }
}
/** Class representing an OpenQASM compatible S operation. */
class S extends OpenQASMCompatible {
    constructor(target) {
        super();
        this.target = target;
    }
}
/** Class representing an OpenQASM compatible SWAP operation. */
class SWAP extends OpenQASMCompatible {
    constructor(qubit0, qubit1) {
        super();
        this.qubit0 = qubit0;
        this.qubit1 = qubit1;
    }
}
/** Class representing an OpenQASM compatible T operation. */
class T extends OpenQASMCompatible {
    constructor(target) {
        super();
        this.target = target;
    }
}
/** Class representing an OpenQASM compatible X operation. */
class X extends OpenQASMCompatible {
    constructor(target) {
        super();
        this.target = target;
    }
}
/** Class representing an OpenQASM compatible Y operation. */
class Y extends OpenQASMCompatible {
    constructor(target) {
        super();
        this.target = target;
    }
}
/** Class representing an OpenQASM compatible Z operation. */
class Z extends OpenQASMCompatible {
    constructor(target) {
        super();
        this.target = target;
    }
}
/** Class representing an OpenQASM compatible ApplyUnitary operation. */
class ApplyUnitary extends AstNode {
    constructor(unitary, qubits) {
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
    constructor(name, qubits) {
        super();
        this.name = name;
        this.qubits = qubits;
    }
}
/** Class representing a borrow statement. */
class Borrow extends AstNode {
    constructor(name, qubits) {
        super();
        this.name = name;
        this.qubits = qubits;
    }
}
/** Class representing an import. */
class Import extends AstNode {
    constructor(val) {
        super();
        this.val = val;
    }
}
/** Base class representing a basic parameter. */
class Parameter extends AstNode {
    constructor(repr) {
        super();
        this.repr = repr;
    }
}
/** Class representing an identifier. */
class Id extends Parameter {
    constructor(id) {
        super(id);
        this.id = id;
    }
}
/** Class representing an array. */
class Arr extends Parameter {
    constructor(vals, size) {
        const isRange = (!((vals.length == 1) && ((vals[0] instanceof GetParam) || (vals[0] instanceof IndexedSet))));
        let repr = '';
        if (isRange) {
            repr = '[';
        }
        for (let param of vals) {
            repr += `${param.repr},`;
        }
        if (isRange) {
            repr += ']';
        }
        super(repr);
        this.vals = vals;
        this.size = size;
    }
}
/** Class representing a tuple. */
class Tuple extends Parameter {
    constructor(vals, size) {
        let repr = '(';
        for (let param of vals) {
            repr += `${param.repr},`;
        }
        repr += ')';
        super(repr);
        this.vals = vals;
        this.size = size;
    }
}
/** Class representing a struct. */
class Struct extends Parameter {
    constructor(vals, names) {
        let repr = '{';
        for (let i = 0; i < vals.length; i++) {
            repr += `${names[i]}: ${vals[i].repr},`;
        }
        repr += '}';
        super(repr);
        this.vals = vals;
        this.names = names;
    }
}
/** Class representing a function. */
class Function extends PossibleCompatibleScope {
    constructor(name, nodes, params, returnType) {
        super();
        this.name = name;
        this.nodes = nodes;
        this.params = params;
        this.returnType = returnType;
    }
}
/** Operation modifiers. */
var Modifier;
(function (Modifier) {
    Modifier[Modifier["Adjoint"] = 0] = "Adjoint";
    Modifier[Modifier["Controlled"] = 1] = "Controlled";
})(Modifier || (Modifier = {}));
/** Class representing a operator modifier. */
class Adjoint extends AstNode {
}
/** Class representing a operator modifier. */
class Controlled extends AstNode {
}
/** Class representing an operation. */
class Operation extends PossibleCompatibleScope {
    constructor(name, nodes, params, modifiers, returnType) {
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
    constructor(val) {
        if (!(val instanceof Expression)) {
            super(val.toString());
        }
        else {
            super(val.repr);
        }
        this.val = val;
    }
}
/** Class representing an integer. */
class BigInt extends Parameter {
    constructor(val) {
        if (!(val instanceof Expression)) {
            super(val.toString());
        }
        else {
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
    constructor(val) {
        super(val);
        this.val = val;
    }
}
/** Class representing a comment. */
class Comment extends OpenQASMCompatible {
    constructor(val) {
        super();
        this.val = val;
    }
}
/** Class representing an iterator. */
class For extends PossibleCompatibleScope {
    constructor(inside, vals, variable) {
        super();
        this.variable = variable;
        this.inside = inside;
        if (vals instanceof Array) {
            this.vals = new Arr(vals, vals.length);
        }
        else {
            this.vals = vals;
        }
    }
}
/** Class representing an iterator. */
class Repeat extends PossibleCompatibleScope {
    constructor(inside, until, fixup) {
        super();
        this.inside = inside;
        this.until = until;
        this.fixup = fixup;
    }
}
/** Class representing an iterator. */
class While extends PossibleCompatibleScope {
    constructor(inside, until) {
        super();
        this.inside = inside;
        this.until = until;
    }
}
/** Class representing a range. */
class Range extends Parameter {
    constructor(lower, upper, step) {
        let repr = '';
        if (step == undefined && !(lower instanceof Continue) && !(upper instanceof Continue)) {
            repr = `${lower.repr}..${upper.repr}`;
        }
        else if (step != undefined && !(lower instanceof Continue) && !(upper instanceof Continue)) {
            repr = `${lower.repr}..${step.repr}..${upper.repr}`;
        }
        else if ((lower instanceof Continue) && (step != undefined) && !(upper instanceof Continue)) {
            repr = `...${step.repr}..${upper.repr}`;
        }
        else if (!(lower instanceof Continue) && (step != undefined) && (upper instanceof Continue)) {
            repr = `${lower.repr}..${step.repr}...`;
        }
        else if ((lower instanceof Continue) && (step == undefined) && !(upper instanceof Continue)) {
            repr = `...${upper.repr}`;
        }
        else if (!(lower instanceof Continue) && (step == undefined) && (upper instanceof Continue)) {
            repr = `${lower.repr}...`;
        }
        else if ((lower instanceof Continue) && (upper instanceof Continue) && (step != undefined)) {
            repr = `...${step.repr}...`;
        }
        else if ((lower instanceof Continue) && (upper instanceof Continue) && (step == undefined)) {
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
    constructor(val) {
        super(val.toString());
        this.val = val;
    }
}
/** Class representing a boolean. */
class Bool extends Parameter {
    constructor(val) {
        super(val.toString());
        this.val = val;
    }
}
/** Class representing a qubit. */
class Qubit extends Parameter {
    constructor(name, length) {
        super(name);
        this.name = name;
        if (typeof length !== 'undefined') {
            this.length = length;
        }
        else {
            this.length = new Int(1);
        }
    }
}
/** Class representing a result. */
class Result extends Parameter {
    constructor(val) {
        super(val.toString());
        this.val = val;
    }
}
/** Class representing a Unit type. */
class UnitType extends AstType {
}
/** Class representing an Int type. */
class IntType extends AstType {
}
/** Class representing a BigInt type. */
class BigIntType extends AstType {
}
/** Class representing a Double type. */
class DoubleType extends AstType {
}
/** Class representing a Bool type. */
class BoolType extends AstType {
}
/** Class representing a String type. */
class StringType extends AstType {
}
/** Class representing a Qubit type. */
class QubitType extends AstType {
}
/** Class representing a Result type. */
class ResultType extends AstType {
}
/** Class representing a Pauli type. */
class PauliType extends AstType {
}
/** Class representing a Range type. */
class RangeType extends AstType {
}
/** Class representing an Array type. */
class ArrayType extends AstType {
}
/** Class representing a Tuple type. */
class TupleType extends AstType {
}
/** Class representing a struct type. */
class StructType extends AstType {
}
/** Class representing an Operation type. */
class OperationType extends AstType {
}
/** Class representing a Function type. */
class FunctionType extends AstType {
}
/** Pauli basis */
var Paulis;
(function (Paulis) {
    Paulis[Paulis["PauliX"] = 0] = "PauliX";
    Paulis[Paulis["PauliY"] = 1] = "PauliY";
    Paulis[Paulis["PauliZ"] = 2] = "PauliZ";
    Paulis[Paulis["PauliI"] = 3] = "PauliI";
})(Paulis || (Paulis = {}));
/** Class representing a result. */
class Pauli extends Parameter {
    constructor(val) {
        if (val == Paulis.PauliI) {
            super('PauliI');
        }
        else if (val == Paulis.PauliX) {
            super('PauliX');
        }
        else if (val == Paulis.PauliY) {
            super('PauliY');
        }
        else if (val == Paulis.PauliZ) {
            super('PauliZ');
        }
        else {
            throw BadArgumentError;
        }
        this.val = val;
    }
}
/** Class representing a variable. */
class Variable extends Parameter {
    constructor(name) {
        super(name);
        this.name = name;
    }
}
/** Class representing a parameter assignment. */
class IndexedSet extends AstNode {
    constructor(name, index, val) {
        super();
        this.index = index;
        this.name = name;
        this.val = val;
    }
}
/** Class representing a parameter assignment. */
class SetParam extends AstNode {
    constructor(instance, val) {
        super();
        this.instance = instance;
        this.val = val;
    }
}
/** Class representing a parameter reference. */
class GetParam extends Parameter {
    constructor(instance, index) {
        super(`${instance}[${index.repr}]`);
        this.instance = instance;
        this.index = index;
    }
}
/** Class representing a condition. */
class Condition extends PossibleCompatibleScope {
    constructor(condition, ifClause, elseClause) {
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
class Is extends AstNode {
}
/** Class representing assignment. */
class Let extends AstNode {
    constructor(expression, variable) {
        super();
        this.expression = expression;
        this.variable = variable;
    }
}
/** Class representing a conjugation. */
class Conjugation extends PossibleCompatibleScope {
    constructor(within, applies) {
        super();
        this.within = within;
        this.applies = applies;
    }
}
/** Class representing mutable assignment. */
class Mutable extends AstNode {
    constructor(expression, variable) {
        super();
        this.expression = expression;
        this.variable = variable;
    }
}
/** Class representing expression. */
class Expression extends Parameter {
    constructor(elements) {
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
    constructor(msg) {
        super();
        this.msg = msg;
    }
}
/** A return statement. */
class Return extends AstNode {
    constructor(expr) {
        super();
        this.expr = expr;
    }
}
/** Class representing an operator application. */
class ApplyOperator extends Parameter {
    // TODO: add modifiers
    constructor(name, params, registers) {
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
        }
        else {
            super(`${name}(${paramRepr})`);
        }
        this.name = name;
        this.registers = registers;
        this.params = params;
    }
}
export { AstNode, Id, Arr, Int, Bool, Mod, Parameter, Condition, Minus, Plus, Times, Divide, Exp, Str, Geq, Leq, Neq, Expression, Qubit, Or, Less, More, And, Not, Left, Right, Variable, Let, SetParam, Range, Struct, Operation, Function, BigInt, Result, Double, Unit, Pauli, Eq, Peq, Meq, Dummy, BitwiseAnd, BitwiseNot, BitwiseOr, BitwiseXor, Use, Borrow, Import, Mutable, Unwrap, For, While, Repeat, Fail, Return, Conjugation, Paulis, Tuple, Modifier, Is, OpenQASMCompatible, PossibleCompatibleScope, AND, CCNOT, CNOT, Ex, H, I, M, Measure, R, R1, R1Frac, Reset, ResetAll, RFrac, Rx, Rxx, Ry, Ryy, Rz, Rzz, S, SWAP, T, X, Y, Z, CZ, ApplyUnitary, Message, UnitType, IntType, BigIntType, DoubleType, BoolType, StringType, QubitType, ResultType, PauliType, RangeType, ArrayType, TupleType, StructType, OperationType, FunctionType, AstType, IndexedSet, GetParam, Comment, ApplyOperator, Continue, Adjoint, Controlled };
//# sourceMappingURL=ast.js.map