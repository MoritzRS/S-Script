import { describe, expect, it, suite } from "vitest";
import { Scope } from "../src/scope";

suite("Scope Test", () => {
	describe("Basic usage", () => {
		it("Creation", () => {
			const scope = new Scope();
			expect(scope.has("x")).toBe(false);
		});

		it("Creation with injection", () => {
			const z = () => 123;
			const scope = new Scope({
				content: {
					x: 123,
					y: 456,
				},
				macros: {
					z: z,
				},
			});

			expect(scope.get("x")).toBe(123);
			expect(scope.get("y")).toBe(456);
			expect(scope.isMacro(z)).toBe(true);
		});

		it("Accessors", () => {
			const scope = new Scope();
			scope.define("x", 123);
			expect(scope.get("x")).toBe(123);
			expect(() => scope.define("x", 456)).toThrow();

			scope.assign("x", 456);
			expect(scope.get("x")).toBe(456);
			expect(() => scope.assign("y")).toThrow();
			expect(() => scope.get("y")).toThrow();
		});

		it("Macros", () => {
			const scope = new Scope();
			const x = () => 123;
			scope.define("x", x);
			expect(scope.isMacro(x)).toBe(false);
			scope.registerMacro(x);
			expect(scope.isMacro(x)).toBe(true);
		});

		it("Parented", () => {
			const parent = new Scope();
			const scope = new Scope({ parent: parent });

			parent.define("x", 123);
			expect(parent.has("x")).toBe(true);
			expect(scope.has("x")).toBe(true);
			expect(scope.get("x")).toBe(123);
			expect(parent.get("x")).toBe(123);
			scope.assign("x", 456);
			expect(scope.get("x")).toBe(456);
			expect(parent.get("x")).toBe(456);

			scope.define("y", 456);
			expect(parent.has("y")).toBe(false);
			expect(scope.has("y")).toBe(true);
			expect(scope.get("y")).toBe(456);
			expect(() => parent.get("y")).toThrow();
			expect(() => parent.assign("y", 123)).toThrow();

			const z = () => 123;
			parent.define("z", z);
			parent.registerMacro(z);
			expect(scope.isMacro(z)).toBe(true);
		});
	});
});
