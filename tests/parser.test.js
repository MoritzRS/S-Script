import { readFileSync } from "fs";
import { resolve } from "path";
import { beforeEach, describe, expect, it, suite } from "vitest";
import { Parser } from "../src/parser";

suite("Parser", () => {
	describe("Basic Expressions", () => {
		/** @type {Parser} */
		let parser;

		beforeEach(() => {
			parser = new Parser();
		});

		it("Spaces", () => {
			expect(parser.parse("   (1 2 3)")).toStrictEqual([[1, 2, 3]]);
			expect(parser.parse("(1 2 3)        ")).toStrictEqual([[1, 2, 3]]);
			expect(parser.parse("    (1 2 3)  ")).toStrictEqual([[1, 2, 3]]);
			expect(parser.parse("")).toStrictEqual([]);
		});

		it("Strings", () => {
			expect(parser.parse('"Test"')).toStrictEqual([["quote", "Test"]]);
			expect(parser.parse('"Test \\"Hello\\""')).toStrictEqual([
				["quote", 'Test \\"Hello\\"'],
			]);
			expect(() => {
				parser.parse('"Test');
			}).toThrow();
		});

		it("Atoms", () => {
			expect(parser.parse("Test")).toStrictEqual(["Test"]);
			expect(parser.parse("123")).toStrictEqual([123]);
			expect(parser.parse("true")).toStrictEqual([true]);
			expect(parser.parse("false")).toStrictEqual([false]);
			expect(parser.parse("null")).toStrictEqual([null]);
			expect(parser.parse("undefined")).toStrictEqual([undefined]);
			expect(parser.parse("nan")[0]).toBeNaN();
			expect(parser.parse("x.y.z")).toStrictEqual([
				["get", ["get", "x", ["quote", "y"]], ["quote", "z"]],
			]);
			expect(() => {
				parser.parse("x..y");
			}).toThrow();
		});

		it("Lists", () => {
			expect(parser.parse("(+ 1 2 3)")).toStrictEqual([["+", 1, 2, 3]]);
			expect(parser.parse("(test Hello World)")).toStrictEqual([["test", "Hello", "World"]]);
			expect(() => {
				parser.parse("(");
			}).toThrow();
			expect(() => {
				parser.parse("(+ 1 2 3");
			}).toThrow();
		});

		it("Quotations", () => {
			expect(parser.parse("'(1 2 3)")).toStrictEqual([["quote", [1, 2, 3]]]);
			expect(() => {
				parser.parse("'test'");
			}).toThrow();
		});

		it("Invalid Expressions", () => {
			expect(() => parser.parse("(+ 1 2")).toThrow();
			expect(() => parser.parse("(+ 1 2))")).toThrow();
		});
	});

	describe("Complex Expressions", () => {
		/** @type {Parser} */
		let parser;

		beforeEach(() => {
			parser = new Parser();
		});

		it("Nested Expressions", () => {
			expect(parser.parse("(+ 1 (+ 2 3))")).toStrictEqual([["+", 1, ["+", 2, 3]]]);
			expect(parser.parse('(% 4 "Test")')).toStrictEqual([["%", 4, ["quote", "Test"]]]);
			expect(parser.parse("(if '(= x 2))")).toStrictEqual([["if", ["quote", ["=", "x", 2]]]]);
		});

		it("Chained Expressions", () => {
			expect(parser.parse("(+ 1 2)(- 3 4)")).toStrictEqual([
				["+", 1, 2],
				["-", 3, 4],
			]);
			expect(parser.parse("(+ 1 2) (- 3 4)")).toStrictEqual([
				["+", 1, 2],
				["-", 3, 4],
			]);
			expect(parser.parse("(+ 1 2)\n(- 3 4)")).toStrictEqual([
				["+", 1, 2],
				["-", 3, 4],
			]);
			expect(parser.parse("(+ 1 2)\r\n(- 3 4)")).toStrictEqual([
				["+", 1, 2],
				["-", 3, 4],
			]);
			expect(parser.parse("(assign x 123)x")).toStrictEqual([["assign", "x", 123], "x"]);
		});

		it("From File", () => {
			const content = readFileSync(resolve(__dirname, "./test")).toString();
			expect(parser.parse(content)).toStrictEqual([
				[
					"function",
					"fac",
					["x"],
					["if", [["=", "x", 1], "x"], [true, ["*", "x", ["fac", ["-", "x", 1]]]]],
				],
				["fac", 10],
			]);
		});
	});
});
