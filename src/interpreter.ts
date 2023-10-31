import { Token } from "./token";
import { Scope } from "./scope";
import { Module } from "./module";

export class Interpreter {
	public scope: Scope = new Scope({});

	public tokens: Token[] = [];

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

	public evaluate(token: Token) {
		this.tokens.push(token);
		let value: unknown;
		if (token.type === "value") value = token.value;
		else if (token.type === "identifier") value = this.scope.get(token.value as string);
		else if (token.type === "list") {
			const [fn, ...args] = token.value as Token[];
			const caller = this.evaluate(fn);
			if (typeof caller !== "function") throw "Caller is not a function";

			if (this.scope.isMacro(caller)) value = caller(...args);
			else value = caller(...args.map((e) => this.evaluate(e)));
		} else throw "Unknown Token Type";

		this.tokens.pop();
		return value;
	}

	public evaluateAll(tokens: Token[]) {
		let value: unknown;
		for (const token of tokens) value = this.evaluate(token);
		return value;
	}

	public run(tokens: Token[]) {
		try {
			return this.evaluateAll(tokens);
		} catch (e) {
			throw {
				start: this.tokens.at(-1).start,
				end: this.tokens.at(-1).end,
				raw: this.tokens.at(-1).raw,
				message: e,
			};
		}
	}
}
