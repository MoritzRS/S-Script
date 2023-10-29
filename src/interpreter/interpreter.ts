import { Token } from "../token/tokens";
import { Scope } from "./scope";

export class Interpreter {
	public scope: Scope;

	public statements: {
		start: [number, number, number];
		end: [number, number, number];
		raw: string;
	}[] = [];

	constructor() {
		this.scope = new Scope({
			variables: {
				add: (...values: number[]) => values.reduce((a, b) => a + b),
				sub: (...values: number[]) => values.reduce((a, b) => a - b),
				mul: (...values: number[]) => values.reduce((a, b) => a * b),
				div: (...values: number[]) => values.reduce((a, b) => a / b),
				list: (...values: unknown[]) => values,
				equals: (base: unknown, ...rest: unknown[]) => {
					for (const current of rest) if (current !== base) return false;
					return true;
				},
			},
			constants: {
				PI: Math.PI,
			},
			builtIns: {
				var: (identifier: Token, ...values: Token[]) => {
					if (identifier.type !== "identifier") throw `First parameter is no identifier`;
					const value = this.evaluateAll(values);
					this.scope.defineVariable(identifier.value as string, value);
				},
				const: (identifier: Token, ...values: Token[]) => {
					if (identifier.type !== "identifier") throw `First parameter is no identifier`;
					const value = this.evaluateAll(values);
					this.scope.defineConstant(identifier.value as string, value);
				},
				assign: (identifier: Token, ...values: Token[]) => {
					if (identifier.type !== "identifier") throw `First parameter is no identifier`;
					const value = this.evaluateAll(values);
					this.scope.assign(identifier.value as string, value);
				},
				lambda: (params: Token, ...statements: Token[]) => {
					const scopeRef = this.scope;
					return (...args: unknown[]) => {
						const scope = new Scope({ parent: scopeRef });
						for (let i = 0; i < (params.value as Token[]).length; i++)
							scope.defineVariable(params.value[i].value as string, args[i]);
						return this.withScope(scope, () => this.evaluateAll(statements));
					};
				},
				if: (...params: Token[]) => {
					for (const param of params) {
						const [condition, ...statemetns] = param.value as Token[];
						if (this.evaluate(condition)) return this.evaluateAll(statemetns);
					}
					return undefined;
				},
			},
		});
	}

	public withScope(scope: Scope, callback: () => unknown) {
		const oldScope = this.scope;
		this.scope = scope;
		const value = callback();
		this.scope = oldScope;
		return value;
	}

	public evaluate(token: Token) {
		this.statements.push({
			start: token.start,
			end: token.end,
			raw: token.raw,
		});
		let value: unknown;
		if (token.type === "value") value = token.value;
		else if (token.type === "identifier") value = this.scope.get(token.value as string);
		else if (token.type === "list") {
			const [fn, ...args] = token.value as Token[];
			const caller = this.evaluate(fn);
			if (this.scope.isBuiltin(fn.value as string)) value = (caller as Function)(...args);
			else value = (caller as Function)(...args.map((e) => this.evaluate(e)));
		} else throw "Unknown Token Type";

		this.statements.pop();
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
				start: this.statements.at(-1).start,
				end: this.statements.at(-1).end,
				raw: this.statements.at(-1).raw,
				message: e,
			};
		}
	}
}
