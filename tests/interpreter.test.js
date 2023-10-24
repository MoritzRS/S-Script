import { beforeEach, describe, expect, it, suite } from "vitest";
import { Interpreter } from "../src/interpreter";

suite("Interpreter", () => {
	describe("Basic Evaluation", () => {
		/** @type {Interpreter} */
		let interpreter;

		beforeEach(() => {
			interpreter = new Interpreter();
		});

		it("Evaluate", () => {
			expect(interpreter.evaluate(["list", 1, 2, 3])).toStrictEqual([1, 2, 3]);
			expect(interpreter.evaluate(["define", "x", 123])).toBe(123);
			expect(interpreter.evaluateAll([["define", "y", 456], "y"])).toBe(456);

			expect(() => interpreter.evaluate("z")).toThrow();
			expect(() => interpreter.evaluate([])).toThrow();
			expect(() => interpreter.evaluate(["x", 1, 2, 3])).toThrow();
		});
	});

	describe("Numeric Functions", () => {
		/** @type {Interpreter} */
		let interpreter;

		beforeEach(() => {
			interpreter = new Interpreter();
		});

		it("[+]", () => {
			expect(interpreter.evaluate(["+", 1, 2])).toBe(3);
		});

		it("[-]", () => {
			expect(interpreter.evaluate(["-", 3, 2])).toBe(1);
		});

		it("[*]", () => {
			expect(interpreter.evaluate(["*", 2, 3])).toBe(6);
		});

		it("[/]", () => {
			expect(interpreter.evaluate(["/", 6, 2])).toBe(3);
		});

		it("[%]", () => {
			expect(interpreter.evaluate(["%", 10, 6])).toBe(4);
		});

		it("[**]", () => {
			expect(interpreter.evaluate(["**", 2, 3])).toBe(8);
		});

		it("[&]", () => {
			expect(interpreter.evaluate(["&", 1, 2])).toBe(1 & 2);
		});

		it("[|]", () => {
			expect(interpreter.evaluate(["|", 1, 2])).toBe(1 | 2);
		});

		it("[min]", () => {
			expect(interpreter.evaluate(["min", 2, 3, 4])).toBe(2);
		});

		it("[max]", () => {
			expect(interpreter.evaluate(["max", 2, 3, 4])).toBe(4);
		});

		it("[abs]", () => {
			expect(interpreter.evaluate(["abs", -1])).toBe(1);
		});

		it("[sin]", () => {
			expect(interpreter.evaluate(["sin", Math.PI / 2])).toBe(1);
		});

		it("[cos]", () => {
			expect(interpreter.evaluate(["cos", 0])).toBe(1);
		});

		it("[tan]", () => {
			expect(interpreter.evaluate(["tan", 2])).toBe(Math.tan(2));
		});

		it("[PI]", () => {
			expect(interpreter.evaluate("PI")).toBe(Math.PI);
		});

		it("[E]", () => {
			expect(interpreter.evaluate("E")).toBe(Math.E);
		});
	});

	describe("Logic Functions", () => {
		/** @type {Interpreter} */
		let interpreter;

		beforeEach(() => {
			interpreter = new Interpreter();
		});

		it("[!]", () => {
			expect(interpreter.evaluate(["!", false])).toBe(true);
			expect(interpreter.evaluate(["!", true])).toBe(false);
		});

		it("[not]", () => {
			expect(interpreter.evaluate(["not", true, false])).toStrictEqual([false, true]);
		});

		it("[and]", () => {
			expect(interpreter.evaluate(["and", true, true])).toBe(true);
			expect(interpreter.evaluate(["and", true, false])).toBe(false);
			expect(interpreter.evaluate(["and", false, false])).toBe(false);
		});

		it("[or]", () => {
			expect(interpreter.evaluate(["or", true, true])).toBe(true);
			expect(interpreter.evaluate(["or", true, false])).toBe(true);
			expect(interpreter.evaluate(["or", false, false])).toBe(false);
		});

		it("[=]", () => {
			expect(interpreter.evaluate(["=", 123, 123])).toBe(true);
			expect(interpreter.evaluate(["=", 123, 456])).toBe(false);
		});

		it("[!=]", () => {
			expect(interpreter.evaluate(["!=", 123, 123, 123])).toBe(false);
			expect(interpreter.evaluate(["!=", 123, 456, 123])).toBe(true);
		});

		it("[>]", () => {
			expect(interpreter.evaluate([">", 3, 2, 1])).toBe(true);
			expect(interpreter.evaluate([">", 3, 2, 2])).toBe(false);
			expect(interpreter.evaluate([">", 1, 2, 3])).toBe(false);
		});

		it("[>=]", () => {
			expect(interpreter.evaluate([">=", 3, 2, 1])).toBe(true);
			expect(interpreter.evaluate([">=", 3, 2, 2])).toBe(true);
			expect(interpreter.evaluate([">=", 1, 2, 3])).toBe(false);
		});

		it("[<]", () => {
			expect(interpreter.evaluate(["<", 1, 2, 3])).toBe(true);
			expect(interpreter.evaluate(["<", 1, 2, 2])).toBe(false);
			expect(interpreter.evaluate(["<", 3, 2, 1])).toBe(false);
		});

		it("[<=]", () => {
			expect(interpreter.evaluate(["<=", 1, 2, 3])).toBe(true);
			expect(interpreter.evaluate(["<=", 1, 2, 2])).toBe(true);
			expect(interpreter.evaluate(["<=", 3, 2, 1])).toBe(false);
		});
	});

	describe("Value Functions", () => {
		/** @type {Interpreter} */
		let interpreter;

		beforeEach(() => {
			interpreter = new Interpreter();
		});

		it("[number]", () => {
			expect(interpreter.evaluate(["number", 123])).toBe(123);
			expect(interpreter.evaluate(["number", ["quote", "123"]])).toBe(123);
			expect(interpreter.evaluate(["number", ["quote", "x"]])).toBeNaN();
		});

		it("[boolean]", () => {
			expect(interpreter.evaluate(["boolean", 0])).toBe(false);
			expect(interpreter.evaluate(["boolean", ["quote", "0"]])).toBe(true);
			expect(interpreter.evaluate(["boolean", 1])).toBe(true);
		});

		it("[list]", () => {
			expect(interpreter.evaluate(["list", 1, 2, 3])).toStrictEqual([1, 2, 3]);
		});

		it("[string]", () => {
			expect(interpreter.evaluate(["string", 123])).toStrictEqual("123");
		});

		it("[new]", () => {
			class T {
				constructor(v) {
					this.value = v;
				}
			}
			expect(interpreter.evaluate(["new", T, 123])).toBeInstanceOf(T);
			expect(interpreter.evaluate(["new", T, 123]).value).toBe(123);
		});
	});

	describe("List Functions", () => {
		/** @type {Interpreter} */
		let interpreter;

		beforeEach(() => {
			interpreter = new Interpreter();
		});

		it("[first]", () => {
			expect(interpreter.evaluate(["first", ["list", 1, 2, 3]])).toBe(1);
		});

		it("[last]", () => {
			expect(interpreter.evaluate(["last", ["list", 1, 2, 3]])).toBe(3);
		});

		it("[rest]", () => {
			expect(interpreter.evaluate(["rest", ["list", 1, 2, 3]])).toStrictEqual([2, 3]);
		});

		it("[reverse]", () => {
			expect(interpreter.evaluate(["reverse", ["list", 1, 2, 3]])).toStrictEqual([3, 2, 1]);
		});

		it("[append]", () => {
			expect(
				interpreter.evaluate(["append", ["list", 1, 2, 3], ["list", 4, 5, 6]]),
			).toStrictEqual([1, 2, 3, 4, 5, 6]);
		});

		it("[map]", () => {
			expect(interpreter.evaluate(["map", ["list", 1, 2, 3], (x) => x * 2])).toStrictEqual([
				2, 4, 6,
			]);
		});

		it("[reduce]", () => {
			expect(interpreter.evaluate(["reduce", ["list", 1, 2, 3], (a, b) => a + b, 0])).toBe(6);
		});
	});

	describe("String Functions", () => {
		/** @type {Interpreter} */
		let interpreter;

		beforeEach(() => {
			interpreter = new Interpreter();
		});

		it("[join]", () => {
			expect(
				interpreter.evaluate([
					"join",
					["quote", ","],
					["quote", "Hello"],
					["quote", "World"],
				]),
			).toBe("Hello,World");
		});
	});

	describe("Object Functions", () => {
		/** @type {Interpreter} */
		let interpreter;

		beforeEach(() => {
			interpreter = new Interpreter();
		});

		it("[get]", () => {
			interpreter.scope.define("x", { a: 123 });
			expect(interpreter.evaluate(["get", "x", ["quote", "a"]])).toBe(123);
		});

		it("[set]", () => {
			interpreter.scope.define("x", { a: 123 });
			expect(interpreter.evaluate(["set", "x", ["quote", "a"], 456])).toBe(456);
			expect(interpreter.scope.get("x").a).toBe(456);
		});

		it("[keys]", () => {
			interpreter.scope.define("x", { a: 123 });
			expect(interpreter.evaluate(["keys", "x"])).toStrictEqual(["a"]);
		});

		it("[values]", () => {
			interpreter.scope.define("x", { a: 123 });
			expect(interpreter.evaluate(["values", "x"])).toStrictEqual([123]);
		});
	});

	describe("Function Calling", () => {
		/** @type {Interpreter} */
		let interpreter;

		beforeEach(() => {
			interpreter = new Interpreter();
		});

		it("[eval]", () => {
			expect(interpreter.evaluate(["eval", ["quote", ["+", 1, 2]]])).toBe(3);
		});

		it("[bind]", () => {
			const x = { value: 123 };
			const fn = function () {
				return this.value;
			};
			expect(interpreter.evaluate([["bind", fn, x]])).toBe(123);
		});

		it("[call]", () => {
			expect(interpreter.evaluate(["call", (x, y) => x * y, 2, 3])).toBe(6);
		});

		it("[apply]", () => {
			expect(interpreter.evaluate(["apply", (x, y) => x * y, ["quote", [2, 3]]])).toBe(6);
		});
	});

	describe("Debugging Functions", () => {
		/** @type {Interpreter} */
		let interpreter;

		beforeEach(() => {
			interpreter = new Interpreter();
		});

		it("[type]", () => {
			expect(interpreter.evaluate(["type", 123])).toBe("number");
		});

		it("[print]", () => {
			expect(() => interpreter.evaluate(["print", 123])).not.toThrow();
		});
	});

	describe("Macros", () => {
		/** @type {Interpreter} */
		let interpreter;

		beforeEach(() => {
			interpreter = new Interpreter();
		});

		it("[quote]", () => {
			expect(interpreter.evaluate(["quote", "123"])).toBe("123");
		});

		it("[let]", () => {
			expect(interpreter.scope.has("x")).toBe(false);
			expect(interpreter.evaluate(["let", [["x", 123]], "x"])).toBe(123);
			expect(interpreter.scope.has("x")).toBe(false);
		});

		it("[define]", () => {
			expect(interpreter.scope.has("x")).toBe(false);
			expect(interpreter.evaluate(["define", "x", 123])).toBe(123);
			expect(interpreter.scope.has("x")).toBe(true);
			expect(interpreter.scope.get("x")).toBe(123);
		});

		it("[assign]", () => {
			interpreter.scope.define("x", 123);
			expect(interpreter.evaluate(["assign", "x", 456])).toBe(456);
			expect(interpreter.scope.get("x")).toBe(456);
		});

		it("[object]", () => {
			expect(interpreter.evaluate(["object", ["x", 123], ["y", 456]])).toStrictEqual({
				x: 123,
				y: 456,
			});
		});

		it("[if]", () => {
			expect(interpreter.evaluate(["if", [true, 123]])).toBe(123);
			expect(interpreter.evaluate(["if", [false, 123]])).toBe(undefined);
			expect(interpreter.evaluate(["if", [false, 123], [true, 456]])).toBe(456);
		});

		it("[lambda]", () => {
			expect(interpreter.evaluate([["lambda", ["x"], "x"], 123])).toBe(123);
		});

		it("[function]", () => {
			expect(
				interpreter.evaluateAll([
					["function", "myFunc", ["x"], "x"],
					["myFunc", 123],
				]),
			).toBe(123);
		});

		it("[macro]", () => {
			expect(
				interpreter.evaluateAll([
					["macro", "myMacro", ["x"], ["*", "x", 2]],
					["myMacro", 2],
				]),
			).toBe(4);
		});

		it("[while]", () => {
			expect(
				interpreter.evaluate([
					"let",
					[["x", 0]],
					["while", ["<", "x", 3], ["assign", "x", ["+", "x", 1]], "x"],
				]),
			).toBe(3);
		});

		it("[loop]", () => {
			expect(interpreter.evaluate(["loop", ["i", 0, 3], "i"])).toBe(3);
		});
	});
});
