
/** Base class representing a basic AST node. */
class AstNode {}

/** Class representing an identifier. */
class Id extends AstNode {
    id:string;
    constructor(id:string) {
        super();
        this.id = id;
    }
}

/** Class representing a use statement. */
class Use extends AstNode {
    qubits:Tuple<Qubit>;
    constructor(qubits:Tuple<Qubit>) {
        super();
        this.qubits = qubits;
    }
}

/** Class representing a borrow statement. */
class Borrow extends AstNode {
    qubits:Tuple<Qubit>;
    constructor(qubits:Tuple<Qubit>) {
        super();
        this.qubits = qubits;
    }
}

/** Class representing an import. */
class Import extends AstNode {
    val:string;
    constructor(val:string) {
        super();
        this.val = val;
    }
}

/** Base class representing a basic parameter. */
class Parameter extends AstNode {
    name?:string;
    constructor(name?:string) {
        super();
        this.name = name;
    }
}

/** Class representing an array. */
class Arr<Parameter> extends Parameter {
    vals:Array<Parameter>;
    size:Array<Int>;
    constructor(vals:Array<Parameter>, size:Array<Int>) {
        super();
        this.vals = vals;
        this.size = size;
    }
}

/** Class representing a tuple. */
class Tuple<Parameter> extends Parameter {
    vals:Array<Parameter>;
    size:Array<Int>;
    constructor(vals:Array<Parameter>, size:Array<Int>) {
        super();
        this.vals = vals;
        this.size = size;
    }
}

/** Class representing a struct. */
class Struct<Parameter> extends Parameter {
    vals:Array<Parameter>;
    names:Array<string>;
    constructor(vals:Array<Parameter>, names:Array<string>) {
        super();
        this.vals = vals;
        this.names = names;
    }
}

/** Class representing a function. */
class Function extends AstNode {
    name:string;
    nodes:Array<AstNode>;
    params:Tuple<Parameter>;
    constructor(name:string, nodes:Array<AstNode>, params:Tuple<Parameter>) {
        super();
        this.name = name;
        this.nodes = nodes;
        this.params = params;
    }
}

/** Operation modifiers. */
enum Modifier {
    Adjoint,
    Controlled
}

/** Class representing an operation. */
class Operation extends AstNode {
    name:string;
    nodes:Array<AstNode>;
    params:Tuple<Parameter>;
    modifiers:Tuple<Modifier>;
    constructor(name:string, nodes:Array<AstNode>, params:Tuple<Parameter>, modifiers:Tuple<Modifier>) {
        super();
        this.name = name;
        this.nodes = nodes;
        this.params = params;
        this.modifiers = modifiers;
    }
}

/** Class representing a float. */
class Double extends Parameter {
    val:AstNode | number;
    constructor(val:AstNode | number) {
        super();
        this.val = val;
    }
}

/** Class representing an integer. */
class BigInt extends Parameter {
    val:AstNode | number;
    constructor(val:AstNode | number) {
        super();
        this.val = val;
    }
}

/** Class representing a unit. */
class Unit extends Parameter {
    val:AstNode | string;
    constructor(val:AstNode | string) {
        super();
        this.val = val;
    }
}

/** Class representing a string. */
class Str extends Parameter {
    val:AstNode | string;
    constructor(val:AstNode | string) {
        super();
        this.val = val;
    }
}

/** Class representing an iterator. */
class For extends AstNode {
    name:string;
    vals:Array<Int | Variable>;
    constructor(name:string, vals:Array<Int | Variable>) {
        super();
        this.name = name;
        this.vals = vals;
    }
}

/** Class representing an iterator. */
class Repeat extends AstNode {
    inside:Array<AstNode>;
    until:Condition;
    fixup:Array<AstNode>;
    constructor(inside:Array<AstNode>, until:Condition, fixup:Array<AstNode>) {
        super();
        this.inside = inside;
        this.until = until;
        this.fixup = fixup;
    }
}

/** Class representing an iterator. */
class While extends AstNode {
    inside:Array<AstNode>;
    until:Condition;
    constructor(inside:Array<AstNode>, until:Condition) {
        super();
        this.inside = inside;
        this.until = until;
    }
}

/** Class representing a range. */
class Range extends Parameter {
    lower:number;
    upper:number;
    constructor(lower:number, upper:number) {
        super();
        this.lower = lower;
        this.upper = upper;
    }
}

/** Class representing an integer. */
class Int extends Parameter {
    val:number;
    constructor(val:number) {
        super();
        this.val = val;
    }
}

/** Class representing a boolean. */
class Bool extends Parameter {
    val:boolean;
    constructor(val:boolean) {
        super();
        this.val = val;
    }
}

/** Class representing a qubit. */
class Qubit extends Parameter {
    name:string;
    constructor(name:string) {
        super();
        this.name = name;
    }
}

/** Class representing a result. */
class Result extends Parameter {
    val:boolean;
    constructor(val:boolean) {
        super();
        this.val = val;
    }
}

/** Pauli basis */
enum Paulis {
    PauliX,
    PauliY,
    PauliZ
}

/** Class representing a result. */
class Pauli extends Parameter {
    val:Paulis;
    constructor(val:Paulis) {
        super();
        this.val = val;
    }
}

/** Class representing a variable. */
class Variable extends Parameter {
    name:string;
    constructor(name:string) {
        super();
        this.name = name;
    }
}

/** Class representing an ancilliary. */
class Ancilliary extends Parameter {
    name:string;
    constructor(name:string) {
        super();
        this.name = name;
    }
}

/** Class representing a parameter assignment. */
class SetParam extends AstNode {
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

/** Class representing a condition. */
class Condition extends AstNode {
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
class Exp extends Parameter {}

/** Class representing minus. */
class Minus extends Parameter {}

/** Class representing a union. */
class Or extends Parameter {}

/** Class representing an intersection. */
class And extends Parameter {}

/** Class representing an inversion. */
class Not extends Parameter {}

/** Class representing plus. */
class Plus extends Parameter {}

/** Class representing times. */
class Times extends Parameter {}

/** Class representing an equality. */
class Equals extends Parameter {}

/** Class representing an inequality. */
class NotEqual extends Parameter {}

/** Class representing divide. */
class Divide extends Parameter {}

/** Class representing power. */
class Power extends Parameter {}

/** Class representing less than. */
class Less extends Parameter {}

/** Class representing bitwise or. */
class BitwiseOr extends Parameter {}

/** Class representing bitwise and. */
class BitwiseAnd extends Parameter {}

/** Class representing bitwise not. */
class BitwiseNot extends Parameter {}

/** Class representing bitwise xor. */
class BitwiseXor extends Parameter {}

/** Class representing greater than. */
class More extends Parameter {}

/** Class representing left angle bracket. */
class Left extends Parameter {}

/** Class representing right angle bracket. */
class Right extends Parameter {}

/** Class representing modulus. */
class Mod extends Parameter {}

/** Class representing an unwrap. */
class Unwrap extends Parameter {}

/** Class representing equality. */
class Eq extends Parameter {}

/** Class representing plus equals. */
class Peq extends Parameter {}

/** Class representing minus equals. */
class Meq extends Parameter {}

/** Class representing not equals. */
class Neq extends Parameter {}

/** Class representing dummy variable. */
class Dummy extends Parameter {}

/** Class representing greater than or equal to. */
class Geq extends Parameter {}

/** Class representing less than or equal to. */
class Leq extends Parameter {}

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
class Conjugation extends AstNode {
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
        super();
        this.elements = elements;
    }
}

/** A program termination. */
class Fail extends AstNode {
    msg:string;
    constructor(msg:string) {
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

/** Class representing assertion. */
class Assert extends AstNode {
    expression:Expression;
    constructor(expression:Expression) {
        super();
        this.expression = expression;
    }
}

export {
    AstNode,
    Assert,
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
    Power,
    Exp,
    Str,
    Geq,
    Leq,
    Neq,
    Expression,
    Equals,
    NotEqual,
    Qubit,
    Or,
    Less,
    More,
    Ancilliary,
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
    Conjugation
};
