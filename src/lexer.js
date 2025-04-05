import { Token, lookup } from './token.js';
/**
 * Returns whether a given character could be an element of a numeric value.
 * @param c - The character.
 * @return Whether the character is numeric.
 */
function isNumeric(c) {
    return (c == '.') || !isNaN(parseInt(c));
}
/**
 * Returns whether a given character is a letter.
 * @param c - The character.
 * @return Whether the character is a letter.
 */
function isLetter(c) {
    if (c.match(/[a-z]/i)) {
        return true;
    }
    return false;
}
/**
 * Returns whether a given character is alphanumeric.
 * @param c - The character.
 * @return Whether the character is alphanumeric.
 */
function isAlpha(c) {
    if (c.match(/^[_0-9a-zA-Z]+$/)) {
        return true;
    }
    return false;
}
/**
 * Returns whether a given character is a newline character.
 * @param c - The character.
 * @return Whether the character is a newline.
 */
function isNewline(c) {
    if (c.match(/\n|\r(?!\n)|\u2028|\u2029|\r\n/g)) {
        return true;
    }
    return false;
}
/** Class representing a lexer. */
class Lexer {
    /**
     * Creates a lexer.
     * @param input - The string to lex.
     * @param cursor - The starting cursor position.
     */
    constructor(input, cursor = 0) {
        /**
         * Calling this method lexes the code represented by the provided string.
         * @return An array of tokens and their corresponding values.
         */
        this.lex = () => {
            let tokens = [];
            let token;
            while (this.cursor < this.input.length) {
                let empty = true;
                let i = 0;
                while (empty) {
                    if (this.peek(i) && isNewline(this.peek(i))) {
                        tokens.push([Token.Newline]);
                        i++;
                    }
                    else {
                        empty = false;
                    }
                }
                token = this.nextToken();
                if (token) {
                    tokens.push(token);
                }
            }
            return tokens;
        };
        /**
         * Reads a character and advances the cursor.
         * @param num - Optional cursor position modifier.
         */
        this.readChar = (num = 1) => {
            this.cursor += num;
            return this.input[this.cursor - num];
        };
        /**
         * Reads a comment.
         * @return The comment string.
         */
        this.readComment = () => {
            let char = this.peek();
            let comment = '';
            while (char && !isNewline(char)) {
                this.readChar();
                comment += char;
                char = this.peek();
            }
            return comment;
        };
        /**
         * Determines whether the next character to process equals a given character.
         * @param c - The given character.
         * @return Whether the next character equals the given character.
         */
        this.peekEq = (c) => (this.peek() == c);
        /**
         * Reads a character without advancing the cursor.
         * @param index - Optional peek position offset.
         */
        this.peek = (index = 0) => this.input[this.cursor + index];
        /**
         * Reads a numeric value.
         * @return The numeric value as a string.
         */
        this.readNumeric = () => {
            let num = '';
            while (isNumeric(this.peek())) {
                if (this.peek() == '.' && this.peek(1) == '.') {
                    break;
                }
                num += this.readChar();
            }
            return num;
        };
        /**
         * Reads an alphanumeric value.
         * @return The alphanumeric value as a string.
         */
        this.readAlpha = () => {
            let alpha = '';
            while (isAlpha(this.peek())) {
                alpha += this.readChar();
            }
            return alpha;
        };
        /**
         * Reads a string literal.
         * @param terminator - The literal's termination character.
         * @return The literal as a string.
         */
        this.readStringLiteral = (terminator) => {
            let lit = '';
            let char = '';
            while (!(terminator == char)) {
                char = this.readChar();
                lit += char;
            }
            return lit;
        };
        /**
         * Advances the cusor past the next block of whitespace.
         */
        this.skipWhitespace = () => {
            while (' \t\n\r\v'.indexOf(this.peek()) > -1) {
                this.cursor += 1;
            }
            return null;
        };
        /**
         * Lexes the next token.
         * @return The next token and its corresponding value.
         */
        this.nextToken = () => {
            this.skipWhitespace();
            if (this.cursor == this.input.length) {
                return [Token.EndOfFile];
            }
            let char = this.peek();
            this.readChar();
            if (char == '.') {
                if (this.peek() == '.') {
                    this.readChar();
                    if (this.peek() == '.') {
                        this.readChar();
                        return [Token.Continue];
                    }
                    else {
                        return [Token.Range];
                    }
                }
                return [Token.Period];
            }
            if (char == '*') {
                return [Token.Times];
            }
            if (char == '^') {
                if (this.peek() == '^') {
                    this.readChar();
                    if (this.peek() == '^') {
                        this.readChar();
                        return [Token.BitwiseXor];
                    }
                }
                return [Token.Exp];
            }
            if (char == ',') {
                return [Token.Comma];
            }
            if (char == ':') {
                return [Token.Colon];
            }
            if (char == '?') {
                return [Token.IfTurnary];
            }
            if (char == '|') {
                if (this.peek() == '|') {
                    this.readChar();
                    if (this.peek() == '|') {
                        this.readChar();
                        return [Token.BitwiseOr];
                    }
                }
                return [Token.ElseTurnary];
            }
            if (char == '/') {
                if (this.peek() == '/') {
                    this.readChar();
                    return [Token.Comment, this.readComment()];
                }
                return [Token.Divide];
            }
            if (char == '-') {
                if (this.peek() == '>') {
                    this.readChar();
                    return [Token.FunctionLambda];
                }
                if (this.peek() == '=') {
                    this.readChar();
                    return [Token.Meq];
                }
                return [Token.Minus];
            }
            if (char == '>') {
                if (this.peek() == '>') {
                    this.readChar();
                    if (this.peek() == '>') {
                        this.readChar();
                        return [Token.Right];
                    }
                }
                else if (this.peek() == '=') {
                    this.readChar();
                    return [Token.Geq];
                }
                return [Token.More];
            }
            if (char == '<') {
                if (this.peek() == '<') {
                    this.readChar();
                    if (this.peek() == '<') {
                        this.readChar();
                        return [Token.Left];
                    }
                }
                else if (this.peek() == '=') {
                    this.readChar();
                    return [Token.Leq];
                }
                else if (this.peek() == '-') {
                    this.readChar();
                    return [Token.Assign];
                }
                return [Token.Less];
            }
            if (char == '=') {
                if (this.peek() == '=') {
                    this.readChar();
                    return [Token.Eq];
                }
                else if (this.peek() == '>') {
                    this.readChar();
                    return [Token.OperationLambda];
                }
                return [Token.Eq];
            }
            if (char == '_') {
                return [Token.Dummy];
            }
            if (char == ';') {
                return [Token.Semi];
            }
            if (char == 'w') {
                if (this.peek() == '\\') {
                    this.readChar();
                    return [Token.With];
                }
            }
            if (char == '+') {
                if (this.peek() == '=') {
                    this.readChar();
                    return [Token.Peq];
                }
                return [Token.Plus];
            }
            if (char == '\"') {
                let stringLiteral = char + this.readStringLiteral('\"');
                return [Token.String, new String(stringLiteral)];
            }
            if (char == '\'') {
                return [Token.SingleQuote];
            }
            if (char == '$') {
                let literal = char + this.readAlpha();
                return [Token.String, literal];
            }
            if (char == '&') {
                if (this.peek() == '&') {
                    this.readChar();
                    if (this.peek() == '&') {
                        this.readChar();
                        return [Token.BitwiseAnd];
                    }
                }
            }
            if (char == '~') {
                if (this.peek() == '~') {
                    this.readChar();
                    if (this.peek() == '~') {
                        this.readChar();
                        return [Token.BitwiseNot];
                    }
                }
            }
            if (char == '!') {
                if (this.peek() == '=') {
                    this.readChar();
                    return [Token.Neq];
                }
                return [Token.Unwrap];
            }
            if (char == '(') {
                return [Token.Lbrac];
            }
            if (char == '(') {
                return [Token.Rbrac];
            }
            if (char == '[') {
                return [Token.Lsqbrac];
            }
            if (char == ']') {
                return [Token.Rsqbrac];
            }
            if (char == '{') {
                return [Token.Lcurlbrac];
            }
            if (char == '}') {
                return [Token.Rcurlbrac];
            }
            if (char == '%') {
                return [Token.Mod];
            }
            if (isLetter(char)) {
                let literal = char + this.readAlpha();
                if (literal.toLowerCase() == 'true') {
                    return [Token.True];
                }
                else if (literal.toLowerCase() == 'false') {
                    return [Token.False];
                }
                else if (literal.toLowerCase() == 'Zero') {
                    return [Token.Zero];
                }
                else if (literal.toLowerCase() == 'One') {
                    return [Token.One];
                }
                else if (literal.toLowerCase() == 'PauliX') {
                    return [Token.PauliX];
                }
                else if (literal.toLowerCase() == 'PauliY') {
                    return [Token.PauliY];
                }
                else if (literal.toLowerCase() == 'PauliZ') {
                    return [Token.PauliZ];
                }
                else if (literal.toLowerCase() == 'if') {
                    return [Token.If];
                }
                else if (literal.toLowerCase() == 'elif') {
                    return [Token.Elif];
                }
                else if (literal.toLowerCase() == 'else') {
                    return [Token.Else];
                }
                else if (literal.toLowerCase() == 'or') {
                    return [Token.Or];
                }
                else if (literal.toLowerCase() == 'and') {
                    return [Token.And];
                }
                else if (literal.toLowerCase() == 'not') {
                    return [Token.Not];
                }
                else if (literal.toLowerCase() == 'let') {
                    return [Token.Let];
                }
                else if (literal.toLowerCase() == 'mutable') {
                    return [Token.Mutable];
                }
                else if (literal.toLowerCase() == 'new') {
                    return [Token.New];
                }
                else if (literal.toLowerCase() == 'function') {
                    return [Token.Function];
                }
                else if (literal.toLowerCase() == 'operation') {
                    return [Token.Operation];
                }
                else if (literal.toLowerCase() == 'use') {
                    return [Token.Use];
                }
                else if (literal.toLowerCase() == 'borrow') {
                    return [Token.Borrow];
                }
                else if (literal.toLowerCase() == 'adjoint') {
                    return [Token.Adjoint];
                }
                else if (literal.toLowerCase() == 'controlled') {
                    return [Token.Controlled];
                }
                else if (literal.toLowerCase() == 'adj') {
                    return [Token.Adjoint];
                }
                else if (literal.toLowerCase() == 'ctl') {
                    return [Token.Controlled];
                }
                else if (literal.toLowerCase() == 'return') {
                    return [Token.Return];
                }
                else if (literal.toLowerCase() == 'fail') {
                    return [Token.Fail];
                }
                else if (literal.toLowerCase() == 'for') {
                    return [Token.For];
                }
                else if (literal.toLowerCase() == 'repeat') {
                    return [Token.Repeat];
                }
                else if (literal.toLowerCase() == 'until') {
                    return [Token.Until];
                }
                else if (literal.toLowerCase() == 'fixup') {
                    return [Token.Fixup];
                }
                else if (literal.toLowerCase() == 'while') {
                    return [Token.While];
                }
                else if (literal.toLowerCase() == 'in') {
                    return [Token.In];
                }
                else if (literal.toLowerCase() == 'within') {
                    return [Token.Within];
                }
                else if (literal.toLowerCase() == 'apply') {
                    return [Token.Apply];
                }
                else if (literal.toLowerCase() == 'is') {
                    return [Token.Is];
                }
                else if (literal.toLowerCase() == 'and') {
                    return [Token.AND];
                }
                else if (literal.toLowerCase() == 'ccnot') {
                    return [Token.CCNOT];
                }
                else if (literal.toLowerCase() == 'cnot') {
                    return [Token.CNOT];
                }
                else if (literal.toLowerCase() == 'exp') {
                    return [Token.Ex];
                }
                else if (literal.toLowerCase() == 'h') {
                    return [Token.H];
                }
                else if (literal.toLowerCase() == 'i') {
                    return [Token.I];
                }
                else if (literal.toLowerCase() == 'm') {
                    return [Token.M];
                }
                else if (literal.toLowerCase() == 'measure') {
                    return [Token.Measure];
                }
                else if (literal.toLowerCase() == 'r') {
                    return [Token.R];
                }
                else if (literal.toLowerCase() == 'r1') {
                    return [Token.R1];
                }
                else if (literal.toLowerCase() == 'r1frac') {
                    return [Token.R1Frac];
                }
                else if (literal.toLowerCase() == 'reset') {
                    return [Token.Reset];
                }
                else if (literal.toLowerCase() == 'resetall') {
                    return [Token.ResetAll];
                }
                else if (literal.toLowerCase() == 'rfrac') {
                    return [Token.RFrac];
                }
                else if (literal.toLowerCase() == 'rx') {
                    return [Token.Rx];
                }
                else if (literal.toLowerCase() == 'rxx') {
                    return [Token.Rxx];
                }
                else if (literal.toLowerCase() == 'ry') {
                    return [Token.Ry];
                }
                else if (literal.toLowerCase() == 'ryy') {
                    return [Token.Ryy];
                }
                else if (literal.toLowerCase() == 'rz') {
                    return [Token.Rz];
                }
                else if (literal.toLowerCase() == 'rzz') {
                    return [Token.Rzz];
                }
                else if (literal.toLowerCase() == 's') {
                    return [Token.S];
                }
                else if (literal.toLowerCase() == 'swap') {
                    return [Token.SWAP];
                }
                else if (literal.toLowerCase() == 't') {
                    return [Token.T];
                }
                else if (literal.toLowerCase() == 'x') {
                    return [Token.X];
                }
                else if (literal.toLowerCase() == 'y') {
                    return [Token.Y];
                }
                else if (literal.toLowerCase() == 'z') {
                    return [Token.Z];
                }
                else if (literal.toLowerCase() == 'applyunitary') {
                    return [Token.ApplyUnitary];
                }
                else if (literal.toLowerCase() == 'message') {
                    return [Token.Message];
                }
                else if (literal.toLowerCase() == 'unit') {
                    return [Token.UnitType];
                }
                else if (literal.toLowerCase() == 'int') {
                    return [Token.IntType];
                }
                else if (literal.toLowerCase() == 'bigint') {
                    return [Token.BigIntType];
                }
                else if (literal.toLowerCase() == 'double') {
                    return [Token.DoubleType];
                }
                else if (literal.toLowerCase() == 'bool') {
                    return [Token.BoolType];
                }
                else if (literal.toLowerCase() == 'string') {
                    return [Token.StringType];
                }
                else if (literal.toLowerCase() == 'qubit') {
                    return [Token.QubitType];
                }
                else if (literal.toLowerCase() == 'result') {
                    return [Token.ResultType];
                }
                else if (literal.toLowerCase() == 'pauli') {
                    return [Token.PauliType];
                }
                else if (literal.toLowerCase() == 'range') {
                    return [Token.RangeType];
                }
                else if (literal.toLowerCase() == 'array') {
                    return [Token.ArrayType];
                }
                else if (literal.toLowerCase() == 'tuple') {
                    return [Token.TupleType];
                }
                else if (literal.toLowerCase() == 'struct') {
                    return [Token.StructType];
                }
                else if (literal.toLowerCase() == 'operation') {
                    return [Token.OperationType];
                }
                else if (literal.toLowerCase() == 'function') {
                    return [Token.FunctionType];
                }
                else if (literal.toLowerCase() == 'import') {
                    return [Token.Import];
                }
                return [Token.Identifier, literal.toString()];
            }
            else if (!isNumeric(char)) {
                let look = lookup(char);
                if (look != Token.Identifier) {
                    return [lookup(char)];
                }
                else {
                    return [Token.Illegal];
                }
            }
            else {
                let num = char + this.readNumeric();
                let parsed = parseFloat(num);
                if (num.indexOf('.') != -1) {
                    return [Token.Double, parsed];
                }
                else if (parsed <= 9223372036854775807) {
                    return [Token.Int, parsed];
                }
                else if (parsed > 9223372036854775807) {
                    return [Token.BigInt, parsed];
                }
            }
        };
        this.input = input;
        this.cursor = cursor;
    }
}
export default Lexer;
//# sourceMappingURL=lexer.js.map