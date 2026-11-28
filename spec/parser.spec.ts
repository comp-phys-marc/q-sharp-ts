import "jasmine";
import Lexer from "../src/lexer";
import Parser from "../src/parser";
import {
    AstNode, Bool, CNOT, Double, Expression, H, Int, Let, Qubit,
    Return, Str, Use, Variable, Plus, Minus, Times, Divide, Eq, Less, And
} from "../src/ast";
import { BadApplicationError, BadBindingError, BadIdentifierError, BadUseError } from "../src/errors";

function parse(source: string): Array<AstNode> {
    return new Parser(new Lexer(source).lex()).parse();
}

describe("parser", () => {
    it("returns an empty AST for empty input", () => {
        expect(parse("")).toEqual([]);
    });

    it("returns an empty AST for whitespace-only input", () => {
        expect(parse("  \n\n")).toEqual([]);
    });

    [0, 1, 42].forEach(value => {
        it(`preserves integer ${value} in a binding`, () => {
            expect(parse(`let count = ${value};\n`)).toEqual([
                new Let(new Expression([new Int(value)]), new Variable("count"))
            ]);
        });
    });

    it("preserves a fractional literal in a binding", () => {
        expect(parse("let angle = 3.25;\n")).toEqual([
            new Let(new Expression([new Double(3.25)]), new Variable("angle"))
        ]);
    });

    [true, false].forEach(value => {
        it(`preserves boolean ${value} in a binding`, () => {
            expect(parse(`let flag = ${value};\n`)).toEqual([
                new Let(new Expression([new Bool(value)]), new Variable("flag"))
            ]);
        });
    });

    it("keeps consecutive bindings as distinct AST nodes", () => {
        expect(parse("let first = 1;\nlet second = 2;\n")).toEqual([
            new Let(new Expression([new Int(1)]), new Variable("first")),
            new Let(new Expression([new Int(2)]), new Variable("second"))
        ]);
    });

    it("preserves a literal return expression", () => {
        expect(parse("return 42;\n")).toEqual([
            new Return(new Expression([new Int(42)]))
        ]);
    });

    it("parses scalar qubit allocation before a gate", () => {
        expect(parse("use q = Qubit();\nH(q);\n")).toEqual([
            new Use(new Str("q"), new Qubit("q")),
            new H(new Qubit("q"))
        ]);
    });

    it("retains the declared register size", () => {
        expect(parse("use register = Qubit[3];\n")).toEqual([
            new Use(new Str("register"), new Qubit("register", new Int(3)))
        ]);
    });

    it("preserves the control and target order of CNOT", () => {
        expect(parse("use a = Qubit();\nuse b = Qubit();\nCNOT(a, b);\n")).toEqual([
            new Use(new Str("a"), new Qubit("a")),
            new Use(new Str("b"), new Qubit("b")),
            new CNOT(new Qubit("a"), new Qubit("b"))
        ]);
    });

    it("does not leak declared symbols between parser instances", () => {
        parse("let local = 1;\n");
        expect(() => parse("local;\n")).toThrow(BadIdentifierError);
    });

    it("rejects a binding without an equals sign", () => {
        expect(() => parse("let count 1;\n")).toThrow(BadBindingError);
    });

    it("rejects invalid qubit allocation", () => {
        expect(() => parse("use q = 1;\n")).toThrow(BadUseError);
    });

    it("rejects a gate without a parenthesized argument", () => {
        expect(() => parse("H q;\n")).toThrow(BadApplicationError);
    });

    [
        {source: "2 + 3", operator: new Plus()},
        {source: "8 - 3", operator: new Minus()},
        {source: "2 * 3", operator: new Times()},
        {source: "8 / 2", operator: new Divide()},
        {source: "2 == 3", operator: new Eq()},
        {source: "2 < 3", operator: new Less()}
    ].forEach(({source, operator}) => {
        it(`preserves the operator and operands in ${source}`, () => {
            const operands = source.split(" ");
            expect(parse(`return ${source};\n`)).toEqual([
                new Return(new Expression([
                    new Int(Number(operands[0])), operator, new Int(Number(operands[2]))
                ]))
            ]);
        });
    });

    it("preserves both operands of a boolean conjunction", () => {
        expect(parse("return true and false;\n")).toEqual([
            new Return(new Expression([new Bool(true), new And(), new Bool(false)]))
        ]);
    });

    it("rejects an unknown name in a return expression", () => {
        expect(() => parse("return missing;\n")).toThrow(BadIdentifierError);
    });

    it("rejects a binding without a variable name", () => {
        expect(() => parse("let = 1;\n")).toThrow(BadBindingError);
    });

    it("rejects allocation from a non-Qubit constructor", () => {
        expect(() => parse("use q = Int();\n")).toThrow(BadUseError);
    });

    it("rejects a single-qubit gate with no argument", () => {
        expect(() => parse("H();\n")).toThrow(BadApplicationError);
    });

    it("rejects CNOT without a second qubit", () => {
        expect(() => parse("use q = Qubit();\nCNOT(q);\n")).toThrow(BadApplicationError);
    });
});
