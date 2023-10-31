import { Module } from "../module";
import { Scope } from "../scope";
import { Token } from "../token";

export const core: Module = {
	variables: {
		// Checks
		"number?": (value: unknown) => typeof value === "number",
		"string?": (value: unknown) => typeof value === "string",
		"boolean?": (value: unknown) => typeof value === "boolean",
		"function?": (value: unknown) => typeof value === "function",
		"list?": (value: unknown) => Array.isArray(value),
		"object?": (value: unknown) => typeof value === "object",
		"null?": (value: unknown) => value === null,
		"undefined?": (value: unknown) => value === undefined,

		display: (value: unknown) => console.log(value),

		// Logic
		equals: (base: unknown, ...values: unknown[]) => {
			for (const value of values) if (value !== base) return false;
			return true;
		},
		not: (value: unknown) => !value,
		and: (...values: unknown[]) => {
			for (const value of values) if (!value) return false;
			return true;
		},
		or: (...values: unknown[]) => {
			for (const value of values) if (value) return true;
			return false;
		},

		// Function calling
		bind: (fn: Function, context: unknown) => fn.bind(context),
		call: (fn: Function, ...args: unknown[]) => fn(...args),
		apply: (fn: Function, args: unknown[]) => fn(...args),
	},

	macros: {
		var: function (identifier, ...statements) {
			if (identifier.type !== "identifier") {
				this.tokens.push(identifier);
				throw "Expected an Identifier";
			}

			const value = this.evaluateAll(statements);
			this.scope.defineVariable(identifier.value, value);
			return value;
		},
		const: function (identifier, ...statements) {
			if (identifier.type !== "identifier") {
				this.tokens.push(identifier);
				throw "Expected an Identifier";
			}

			const value = this.evaluateAll(statements);
			this.scope.defineConstant(identifier.value, value);
			return value;
		},
		let: function (variables, ...statements) {
			if (variables.type !== "list") {
				this.tokens.push(variables);
				throw "Expected a list of declarations";
			}

			const scope = new Scope({ parent: this.scope });
			for (const declaration of variables.value) {
				if (declaration.type !== "list") {
					this.tokens.push(declaration);
					throw "Expected a declaration";
				}

				if (declaration.value.length !== 2) {
					this.tokens.push(declaration);
					throw "Too many items in declaration";
				}

				const [identifier, value] = declaration.value;

				if (identifier.type !== "identifier") {
					this.tokens.push(identifier);
					throw "Expected an Identifier";
				}

				scope.defineVariable(identifier.value, this.evaluate(value));
			}
			return this.withScope(scope, () => this.evaluateAll(statements));
		},
		assign: function (identifier, ...statements) {
			if (identifier.type !== "identifier") {
				this.tokens.push(identifier);
				throw "Expected an Identifier";
			}

			const value = this.evaluateAll(statements);
			this.scope.assign(identifier.value, value);
			return value;
		},
		lambda: function (parameters, ...statements) {
			if (parameters.type !== "list") {
				this.tokens.push(parameters);
				throw "Expected a list of parameters";
			}
			const params = parameters.value.map((e) => {
				if (e.type !== "identifier") {
					this.tokens.push(e);
					throw "Expected an identifier";
				}
				return e.value;
			});
			const scopeRef = this.scope;
			return (...args: unknown[]) => {
				const scope = new Scope({ parent: scopeRef });
				for (let i = 0; i < params.length; i++) scope.defineVariable(params[i], args[i]);
				return this.withScope(scope, () => this.evaluateAll(statements));
			};
		},
		function: function (name, parameters, ...statements) {
			if (name.type !== "identifier") {
				this.tokens.push(name);
				throw "Expected an identifier";
			}
			if (parameters.type !== "list") {
				this.tokens.push(parameters);
				throw "Expected a list of parameters";
			}
			const params = parameters.value.map((e) => {
				if (e.type !== "identifier") {
					this.tokens.push(e);
					throw "Expected an identifier";
				}
				return e.value;
			});
			const scopeRef = this.scope;
			this.scope.defineVariable(name.value, (...args: unknown[]) => {
				const scope = new Scope({ parent: scopeRef });
				for (let i = 0; i < params.length; i++) scope.defineVariable(params[i], args[i]);
				return this.withScope(scope, () => this.evaluateAll(statements));
			});
		},
		macro: function (name, parameters, ...statements) {
			if (name.type !== "identifier") {
				this.tokens.push(name);
				throw "Expected an identifier";
			}
			if (parameters.type !== "list") {
				this.tokens.push(parameters);
				throw "Expected a list of parameters";
			}
			const params = parameters.value.map((e) => {
				if (e.type === "identifier") return e;
				this.tokens.push(e);
				throw "Expected an identifier";
			});

			this.scope.defineMacro(name.value, (...args) => {
				if (args.length < params.length) throw "Not enough arguments provided";
				else if (args.length > params.length) throw "Too many arguments provided";
				const argMap = new Map<string, Token>();
				for (let i = 0; i < params.length; i++) argMap.set(params[i].value, args[i]);

				const inject = (token: Token) => {
					if (token.type === "identifier") {
						if (!argMap.has(token.value)) return token;
						return argMap.get(token.value);
					}
					if (token.type === "list")
						return {
							...token,
							value: token.value.map((e) => inject(e)),
						};

					return token;
				};

				return this.evaluateAll(statements.map((e) => inject(e)));
			});
		},
		if: function (...statements) {
			for (const statement of statements) {
				if (statement.type !== "list") {
					this.tokens.push(statement);
					throw "Expected a List";
				}

				const [condition, ...rest] = statement.value;
				if (this.evaluate(condition)) return this.evaluateAll(rest);
			}
		},
		while: function (condition, ...statements) {
			let value: unknown;
			while (this.evaluate(condition)) value = this.evaluateAll(statements);
			return value;
		},
		loop: function (prefix, condition, suffix, ...statements) {
			return this.withScope(new Scope({ parent: this.scope }), () => {
				let value: unknown;
				this.evaluate(prefix);
				while (this.evaluate(condition)) {
					value = this.evaluateAll(statements);
					this.evaluate(suffix);
				}
				return value;
			});
		},
	},
};
