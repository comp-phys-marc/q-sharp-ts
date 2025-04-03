var Token;
(function (Token) {
    // Intrinsic Q# library
    Token[Token["AND"] = 0] = "AND";
    Token[Token["CCNOT"] = 1] = "CCNOT";
    Token[Token["CNOT"] = 2] = "CNOT";
    Token[Token["Ex"] = 3] = "Ex";
    Token[Token["H"] = 4] = "H";
    Token[Token["I"] = 5] = "I";
    Token[Token["M"] = 6] = "M";
    Token[Token["Measure"] = 7] = "Measure";
    Token[Token["R"] = 8] = "R";
    Token[Token["R1"] = 9] = "R1";
    Token[Token["R1Frac"] = 10] = "R1Frac";
    Token[Token["Reset"] = 11] = "Reset";
    Token[Token["ResetAll"] = 12] = "ResetAll";
    Token[Token["RFrac"] = 13] = "RFrac";
    Token[Token["Rx"] = 14] = "Rx";
    Token[Token["Rxx"] = 15] = "Rxx";
    Token[Token["Ry"] = 16] = "Ry";
    Token[Token["Ryy"] = 17] = "Ryy";
    Token[Token["Rz"] = 18] = "Rz";
    Token[Token["Rzz"] = 19] = "Rzz";
    Token[Token["S"] = 20] = "S";
    Token[Token["SWAP"] = 21] = "SWAP";
    Token[Token["T"] = 22] = "T";
    Token[Token["X"] = 23] = "X";
    Token[Token["Y"] = 24] = "Y";
    Token[Token["Z"] = 25] = "Z";
    Token[Token["ApplyUnitary"] = 26] = "ApplyUnitary";
    Token[Token["Message"] = 27] = "Message";
    // end intrinsic lib
    Token[Token["With"] = 28] = "With";
    Token[Token["Assign"] = 29] = "Assign";
    Token[Token["If"] = 30] = "If";
    Token[Token["IfTurnary"] = 31] = "IfTurnary";
    Token[Token["Elif"] = 32] = "Elif";
    Token[Token["Else"] = 33] = "Else";
    Token[Token["ElseTurnary"] = 34] = "ElseTurnary";
    Token[Token["Plus"] = 35] = "Plus";
    Token[Token["Minus"] = 36] = "Minus";
    Token[Token["Times"] = 37] = "Times";
    Token[Token["Divide"] = 38] = "Divide";
    Token[Token["Eq"] = 39] = "Eq";
    Token[Token["Neq"] = 40] = "Neq";
    Token[Token["Leq"] = 41] = "Leq";
    Token[Token["Geq"] = 42] = "Geq";
    Token[Token["Peq"] = 43] = "Peq";
    Token[Token["Meq"] = 44] = "Meq";
    Token[Token["Dummy"] = 45] = "Dummy";
    Token[Token["Int"] = 46] = "Int";
    Token[Token["Unit"] = 47] = "Unit";
    Token[Token["BigInt"] = 48] = "BigInt";
    Token[Token["Double"] = 49] = "Double";
    Token[Token["Bool"] = 50] = "Bool";
    Token[Token["String"] = 51] = "String";
    Token[Token["Qubit"] = 52] = "Qubit";
    Token[Token["Result"] = 53] = "Result";
    Token[Token["Pauli"] = 54] = "Pauli";
    Token[Token["Range"] = 55] = "Range";
    Token[Token["Array"] = 56] = "Array";
    Token[Token["Tuple"] = 57] = "Tuple";
    Token[Token["struct"] = 58] = "struct";
    Token[Token["Operation"] = 59] = "Operation";
    Token[Token["Function"] = 60] = "Function";
    Token[Token["Exp"] = 61] = "Exp";
    Token[Token["Period"] = 62] = "Period";
    Token[Token["Comma"] = 63] = "Comma";
    Token[Token["Colon"] = 64] = "Colon";
    Token[Token["Quote"] = 65] = "Quote";
    Token[Token["SingleQuote"] = 66] = "SingleQuote";
    Token[Token["Lbrac"] = 67] = "Lbrac";
    Token[Token["Rbrac"] = 68] = "Rbrac";
    Token[Token["Lsqbrac"] = 69] = "Lsqbrac";
    Token[Token["Rsqbrac"] = 70] = "Rsqbrac";
    Token[Token["Lcurlbrac"] = 71] = "Lcurlbrac";
    Token[Token["Rcurlbrac"] = 72] = "Rcurlbrac";
    Token[Token["Comment"] = 73] = "Comment";
    Token[Token["Identifier"] = 74] = "Identifier";
    Token[Token["Or"] = 75] = "Or";
    Token[Token["And"] = 76] = "And";
    Token[Token["Not"] = 77] = "Not";
    Token[Token["BitwiseAnd"] = 78] = "BitwiseAnd";
    Token[Token["BitwiseOr"] = 79] = "BitwiseOr";
    Token[Token["BitwiseNot"] = 80] = "BitwiseNot";
    Token[Token["BitwiseXor"] = 81] = "BitwiseXor";
    Token[Token["Let"] = 82] = "Let";
    Token[Token["Mutable"] = 83] = "Mutable";
    Token[Token["New"] = 84] = "New";
    Token[Token["For"] = 85] = "For";
    Token[Token["In"] = 86] = "In";
    Token[Token["Mod"] = 87] = "Mod";
    Token[Token["Unwrap"] = 88] = "Unwrap";
    Token[Token["Less"] = 89] = "Less";
    Token[Token["More"] = 90] = "More";
    Token[Token["True"] = 91] = "True";
    Token[Token["False"] = 92] = "False";
    Token[Token["Left"] = 93] = "Left";
    Token[Token["Right"] = 94] = "Right";
    Token[Token["Continue"] = 95] = "Continue";
    Token[Token["Semi"] = 96] = "Semi";
    Token[Token["Import"] = 97] = "Import";
    Token[Token["Use"] = 98] = "Use";
    Token[Token["Borrow"] = 99] = "Borrow";
    Token[Token["Adjoint"] = 100] = "Adjoint";
    Token[Token["Controlled"] = 101] = "Controlled";
    Token[Token["FunctionLambda"] = 102] = "FunctionLambda";
    Token[Token["OperationLambda"] = 103] = "OperationLambda";
    Token[Token["Return"] = 104] = "Return";
    Token[Token["Fail"] = 105] = "Fail";
    Token[Token["Repeat"] = 106] = "Repeat";
    Token[Token["Until"] = 107] = "Until";
    Token[Token["Fixup"] = 108] = "Fixup";
    Token[Token["While"] = 109] = "While";
    Token[Token["Within"] = 110] = "Within";
    Token[Token["Apply"] = 111] = "Apply";
    Token[Token["Newline"] = 112] = "Newline";
    Token[Token["EndOfFile"] = 113] = "EndOfFile";
    Token[Token["Illegal"] = 114] = "Illegal";
    Token[Token["Zero"] = 115] = "Zero";
    Token[Token["One"] = 116] = "One";
    Token[Token["PauliX"] = 117] = "PauliX";
    Token[Token["PauliY"] = 118] = "PauliY";
    Token[Token["PauliZ"] = 119] = "PauliZ";
    Token[Token["Is"] = 120] = "Is";
    // begin type names
    Token[Token["UnitType"] = 121] = "UnitType";
    Token[Token["IntType"] = 122] = "IntType";
    Token[Token["BigIntType"] = 123] = "BigIntType";
    Token[Token["DoubleType"] = 124] = "DoubleType";
    Token[Token["BoolType"] = 125] = "BoolType";
    Token[Token["StringType"] = 126] = "StringType";
    Token[Token["QubitType"] = 127] = "QubitType";
    Token[Token["ResultType"] = 128] = "ResultType";
    Token[Token["PauliType"] = 129] = "PauliType";
    Token[Token["RangeType"] = 130] = "RangeType";
    Token[Token["ArrayType"] = 131] = "ArrayType";
    Token[Token["TupleType"] = 132] = "TupleType";
    Token[Token["StructType"] = 133] = "StructType";
    Token[Token["OperationType"] = 134] = "OperationType";
    Token[Token["FunctionType"] = 135] = "FunctionType";
    // end type names
})(Token || (Token = {}));
const paramLookupMap = {
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
};
const lookupMap = Object.assign(Object.assign({}, paramLookupMap), { '?': Token.IfTurnary, '|': Token.ElseTurnary, 'if': Token.If, 'elif': Token.Elif, 'else': Token.Else, ',': Token.Comma, ':': Token.Colon, '"': Token.Quote, '\'': Token.SingleQuote, 'w\\': Token.With, '<-': Token.Assign, '->': Token.FunctionLambda, '=>': Token.OperationLambda, 'let': Token.Let, 'mutable': Token.Mutable, 'new': Token.New, 'function': Token.Function, 'operation': Token.Operation, 'import': Token.Import, 'use': Token.Use, 'borrow': Token.Borrow, 'Adjoint': Token.Adjoint, 'Controlled': Token.Controlled, 'return': Token.Return, 'fail': Token.Fail, 'for': Token.For, 'repeat': Token.Repeat, 'until': Token.Until, 'fixup': Token.Fixup, 'while': Token.While, 'in': Token.In, 'within': Token.Within, 'apply': Token.Apply, 'is': Token.Is, 'CCNOT': Token.CCNOT, 'AND': Token.AND, 'CNOT': Token.CNOT, 'Exp': Token.Ex, 'H': Token.H, 'I': Token.I, 'M': Token.M, 'Measure': Token.Measure, 'R': Token.R, 'R1': Token.R1, 'R1Frac': Token.R1Frac, 'Reset': Token.Reset, 'ResetAll': Token.ResetAll, 'RFrac': Token.RFrac, 'Rx': Token.Rx, 'Rxx': Token.Rxx, 'Ry': Token.Ry, 'Ryy': Token.Ryy, 'Rz': Token.Rz, 'Rzz': Token.Rzz, 'S': Token.S, 'SWAP': Token.SWAP, 'T': Token.T, 'X': Token.X, 'Y': Token.Y, 'Z': Token.Z, 'ApplyUnitary': Token.ApplyUnitary, 'Message': Token.Message, '_': Token.Dummy, ';': Token.Semi, '{': Token.Lcurlbrac, '}': Token.Rcurlbrac, '//': Token.Comment, 'Unit': Token.UnitType, 'Int': Token.IntType, 'BigInt': Token.BigIntType, 'Double': Token.DoubleType, 'Bool': Token.BoolType, 'String': Token.StringType, 'Qubit': Token.QubitType, 'Result': Token.ResultType, 'Pauli': Token.PauliType, 'Range': Token.RangeType, 'Array': Token.ArrayType, 'Tuple': Token.TupleType, 'struct': Token.StructType, 'Operation': Token.OperationType, 'Function': Token.FunctionType });
/**
 * Returns the token that represents a given string.
 * @param ident - The string.
 * @return The corresponding token.
 */
function lookup(ident) {
    return ident in lookupMap ? lookupMap[ident] : Token.Identifier;
}
/**
 * Returns the string representation of a parameter token.
 * @param tokens - The token.
 * @return The string representation of the token.
 */
function inverseParamLookup(token) {
    return Object.keys(paramLookupMap).find((ident) => paramLookupMap[ident] == token);
}
/**
 * Determines whether a token denotes a parameter.
 * @param tokens - The token.
 * @return Whether the token does NOT denote a parameter.
 */
function notParam(token) {
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
export { Token, notParam, lookup, inverseParamLookup };
//# sourceMappingURL=token.js.map