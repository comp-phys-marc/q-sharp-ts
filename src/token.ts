enum Token {
    // Intrinsic Q# library
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
    ApplyUnitary,
    Message,
    // end intrinsic lib
    With,
    Assign,
    If,
    IfTurnary,
    Elif,
    Else,
    ElseTurnary,
    Plus,
    Minus,
    Times,
    Divide,
    Eq,
    Neq,
    Leq,
    Geq,
    Peq,
    Meq,
    Dummy,
    Int,
    Unit,
    BigInt,
    Double,
    Bool,
    String,
    Qubit,
    Result,
    Pauli,
    Range,
    Array,
    Tuple,
    struct,
    Operation,
    Function,
    Exp,
    Period,
    Comma,
    Colon,
    Quote,
    SingleQuote,
    Lbrac,
    Rbrac,
    Lsqbrac,
    Rsqbrac,
    Lcurlbrac,
    Rcurlbrac,
    Comment,
    Identifier,
    Or,
    And,
    Not,
    BitwiseAnd,
    BitwiseOr,
    BitwiseNot,
    BitwiseXor,
    Let, 
    Mutable, 
    New,
    For,
    In,
    Mod,
    Unwrap,
    Less,
    More,
    True,
    False,
    Left, 
    Right,
    Continue,
    Semi,
    Import,
    Use,
    Borrow,
    Adjoint,
    Controlled,
    FunctionLambda,
    OperationLambda,
    Return,
    Fail,
    Repeat,
    Until,
    Fixup,
    While,
    Within,
    Apply,
    Newline,
    EndOfFile,
    Illegal,
    Zero,
    One,
    PauliX,
    PauliY,
    PauliZ,
    Is
}

const paramLookupMap:object = {
    '^': Token.Exp,
    '+': Token.Plus,
    '-': Token.Minus,
    '*': Token.Times,
    '/': Token.Divide,
    '==': Token.Eq,
    '+=': Token.Peq,
    '-=': Token.Meq,
    '!=': Token.Neq,
    '.': Token.Period, 
    '..': Token.Range,
    '...': Token.Continue,
    'true': Token.True,
    'false': Token.False,
    '<=': Token.Leq,
    '>=': Token.Geq,
    'or': Token.Or,
    'and': Token.And,
    'not': Token.Not,
    '(': Token.Lbrac, 
    ')': Token.Rbrac, 
    '[': Token.Lsqbrac,
    ']': Token.Rsqbrac,
    '%': Token.Mod,
    '!': Token.Unwrap,
    '&&&': Token.BitwiseAnd,
    '|||': Token.BitwiseOr,
    '~~~': Token.BitwiseNot,
    '^^^': Token.BitwiseXor,
    '<<<': Token.Left,
    '>>>': Token.Right,
    '<': Token.Less,
    '>': Token.More,
    'Zero': Token.Zero,
    'One': Token.One,
    'PauliX': Token.PauliX,
    'PauliY': Token.PauliY,
    'PauliZ': Token.PauliZ
}

const lookupMap:object = {
    ...paramLookupMap,
    '?': Token.IfTurnary,
    '|': Token.ElseTurnary,
    'if': Token.If,
    'elif': Token.Elif,
    'else': Token.Else,
    ',': Token.Comma, 
    ':': Token.Colon, 
    '"': Token.Quote,
    '\'': Token.SingleQuote,
    'w\\': Token.With, 
    '<-': Token.Assign,
    '->': Token.FunctionLambda,
    '=>': Token.OperationLambda,
    'let': Token.Let,
    'mutable': Token.Mutable,
    'new': Token.New,
    'function': Token.Function, 
    'operation': Token.Operation,
    'import': Token.Import,
    'use': Token.Use,
    'borrow': Token.Borrow,
    'Adjoint': Token.Adjoint,
    'Controlled': Token.Controlled,
    'return': Token.Return,
    'fail': Token.Fail,
    'for': Token.For,
    'repeat': Token.Repeat,
    'until': Token.Until,
    'fixup': Token.Fixup,
    'while': Token.While,
    'in': Token.In,
    'within': Token.Within,
    'apply': Token.Apply,
    'is': Token.Is,
    'CCNOT': Token.CCNOT,
    'AND': Token.AND,
    'CNOT': Token.CNOT,
    'Exp': Token.Ex,
    'H': Token.H,
    'I': Token.I,
    'M': Token.M,
    'Measure': Token.Measure,
    'R': Token.R,
    'R1': Token.R1,
    'R1Frac': Token.R1Frac,
    'Reset': Token.Reset,
    'ResetAll': Token.ResetAll,
    'RFrac': Token.RFrac,
    'Rx': Token.Rx,
    'Rxx': Token.Rxx,
    'Ry': Token.Ry,
    'Ryy': Token.Ryy,
    'Rz': Token.Rz,
    'Rzz': Token.Rzz,
    'S': Token.S,
    'SWAP': Token.SWAP,
    'T': Token.T,
    'X': Token.X,
    'Y': Token.Y,
    'Z': Token.Z,
    'ApplyUnitary': Token.ApplyUnitary,
    'Message': Token.Message,
    '_': Token.Dummy,
    ';': Token.Semi,
    '{': Token.Lcurlbrac,
    '}': Token.Rcurlbrac,
    '//': Token.Comment
}

/**
 * Returns the token that represents a given string.
 * @param ident - The string.
 * @return The corresponding token.
 */
function lookup(ident:string): Token {
    return ident in lookupMap ? lookupMap[ident]: Token.Identifier;
}

/**
 * Returns the string representation of a parameter token.
 * @param tokens - The token.
 * @return The string representation of the token.
 */
function inverseParamLookup(token:Token): string {
    return Object.keys(paramLookupMap).find((ident) => paramLookupMap[ident] == token);
}

/**
 * Determines whether a token denotes a parameter.
 * @param tokens - The token.
 * @return Whether the token does NOT denote a parameter.
 */
function notParam(token:Token): boolean {
    return (Object.keys(paramLookupMap).map(key => paramLookupMap[key]).indexOf(token) == -1) 
    && token != Token.Int 
    && token != Token.Unit
    && token != Token.BigInt
    && token != Token.Double
    && token != Token.Bool
    && token != Token.String
    && token != Token.Qubit
    && token != Token.Result
    && token != Token.Pauli
    && token != Token.Range
    && token != Token.Array
    && token != Token.Tuple
    && token != Token.struct
    && token != Token.Operation
    && token != Token.Function
    && token && token != Token.Identifier;
}

export {
    Token,
    notParam,
    lookup,
    inverseParamLookup
};
