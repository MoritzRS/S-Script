import { Token } from "./token";
import { Scope } from "./scope";
import { Module } from "./module";

export class Interpreter {
	public scope: Scope = new Scope({});

	public callStack: Token[] = [];

	public loadModule({ variables, constants, macros }: Module) {
		const scope = new Scope({ parent: this.scope });
		if (variables) for (const key in variables) scope.defineVariable(key, variables[key]);
		if (constants) for (const key in constants) scope.defineConstant(key, constants[key]);
		if (macros) for (const key in macros) scope.defineMacro(key, macros[key].bind(this));
		this.scope = scope;
	}

	public withScope(scope: Scope, callback: () => unknown) {
		const oldScope = this.scope;
		this.scope = scope;
		const value = callback();
		this.scope = oldScope;
		return value;
	}

	public *evaluate(token: Token): IterableIterator<unknown> {
		this.callStack.push(token);
		if (token.type === "value") yield token.value;
		else if (token.type === "identifier") yield this.scope.get(token.value as string);
		else if (token.type === "list") {
			const [fn, ...args] = token.value as Token[];
			let caller: Function;
			for (const element of this.evaluate(fn)) {
				caller = element as any;
				yield element;
			}
			if (typeof caller !== "function") throw "Caller is not a function";

			if (this.scope.isMacro(caller)) {
				for (const element of caller(...args)) {
					yield element;
				}
			} else {
				const params = [];
				for (const argument of args) {
					let param: unknown;
					for (const element of this.evaluate(argument)) {
						param = element;
						yield element;
					}
					params.push(param);
				}
				for (const element of caller(...params)) {
					yield element;
				}
			}
		} else throw "Unknown Token Type";
		this.callStack.pop();
	}

	public *evaluateAll(tokens: Token[]) {
		for (const token of tokens) {
			for (const element of this.evaluate(token)) {
				yield element;
			}
		}
	}

	public run(tokens: Token[]) {
		let value: unknown;
		for (const element of this.evaluateAll(tokens)) value = element;
		return value;
	}

	public debug(tokens: Token[]) {
		const generator = this.evaluateAll(tokens);
		return () => generator.next();
	}
}
