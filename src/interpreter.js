import { Scope } from "./scope";

/**
 * Instruction Interpreter
 */
export class Interpreter {
	/**
	 * Interpreter Scopes
	 * @type {Scope}
	 */
	scope = new Scope();

	globalScope = new Scope({
		content: {
			// Numeric Functions
			"+": (...values) => values.reduce((a, b) => a + b),
			"-": (...values) => values.reduce((a, b) => a - b),
			"*": (...values) => values.reduce((a, b) => a * b),
			"/": (...values) => values.reduce((a, b) => a / b),
			"%": (...values) => values.reduce((a, b) => a % b),
			"**": (...values) => values.reduce((a, b) => a ** b),
			"&": (...values) => values.reduce((a, b) => a & b),
			"|": (...values) => values.reduce((a, b) => a | b),
			min: (...values) => Math.min(...values),
			max: (...values) => Math.max(...values),
			abs: (value) => Math.abs(value),
			sin: (value) => Math.sin(value),
			cos: (value) => Math.cos(value),
			tan: (value) => Math.tan(value),
			random: (min, max) => Math.random() * (max - min) + min,
			PI: Math.PI,
			E: Math.E,

			// Logic Functions
			"!": (value) => !value,
			not: (...values) => values.map((e) => !e),
			and: (...values) => {
				for (const value of values) if (!value) return false;
				return true;
			},
			or: (...values) => {
				for (const value of values) if (value) return true;
				return false;
			},
			"=": (base, ...values) => {
				for (const value of values) if (value !== base) return false;
				return true;
			},
			"!=": (base, ...values) => {
				for (const value of values) {
					if (value === base) return false;
					base = value;
				}
				return true;
			},
			">": (...values) => {
				for (let i = 1; i < values.length; i++)
					if (!(values[i - 1] > values[i])) return false;
				return true;
			},
			">=": (...values) => {
				for (let i = 1; i < values.length; i++)
					if (!(values[i - 1] >= values[i])) return false;
				return true;
			},
			"<": (...values) => {
				for (let i = 1; i < values.length; i++)
					if (!(values[i - 1] < values[i])) return false;
				return true;
			},
			"<=": (...values) => {
				for (let i = 1; i < values.length; i++)
					if (!(values[i - 1] <= values[i])) return false;
				return true;
			},

			// Value Functions
			number: (value) => Number(value),
			boolean: (value) => !!value,
			list: (...values) => values,
			string: (value) => value.toString(),
			new: (fn, ...parameters) => new fn(...parameters),

			// List Functions
			first: (list) => list.at(0),
			last: (list) => list.at(-1),
			rest: (list) => list.slice(1),
			reverse: (list) => [...list].reverse(),
			append: (...lists) => lists.flat(),
			map: (list, fn) => list.map(fn),
			reduce: (list, fn, initial) => list.reduce(fn, initial),

			// String Functions
			join: (separator, ...strings) => strings.join(separator),
			split: (seperator, string) => string.split(seperator),

			// Object Functions
			get: (object, key) => object[key],
			set: (object, key, value) => {
				object[key] = value;
				return value;
			},
			keys: (object) => Object.keys(object),
			values: (object) => Object.values(object),

			// Function Calling
			eval: (...statements) => this.evaluateAll(statements),
			bind: (fn, target) => fn.bind(target),
			call: (fn, ...args) => fn(...args),
			apply: (fn, args) => fn(...args),

			// Debugging
			type: (value) => typeof value,
			print: (...values) => console.log(...values),
		},

		macros: {
			quote: (value) => value,
			let: (variables, ...statements) => {
				const scope = new Scope({ parent: this.scope });
				for (const [name, value] of variables) scope.define(name, this.evaluate(value));
				return this.withScope(scope, () => this.evaluateAll(statements));
			},
			define: (name, ...values) => {
				const value = this.evaluateAll(values);
				this.scope.define(name, value);
				return value;
			},
			assign: (name, ...values) => {
				const value = this.evaluateAll(values);
				this.scope.assign(name, value);
				return value;
			},
			object: (...properties) => {
				const object = {};
				for (const [name, value] of properties) object[name] = this.evaluate(value);
				return object;
			},
			if: (...conditions) => {
				for (const [condition, ...statements] of conditions)
					if (this.evaluate(condition)) return this.evaluateAll(statements);
			},
			lambda: (parameters, ...statements) => {
				const scopeRef = this.scope;
				return (...args) => {
					const scope = new Scope({ parent: scopeRef });
					for (let i = 0; i < parameters.length; i++)
						scope.define(parameters[i], args[i]);
					return this.withScope(scope, () => this.evaluateAll(statements));
				};
			},
			function: (name, parameters, ...statements) => {
				const scopeRef = this.scope;
				const fn = (...args) => {
					const scope = new Scope({ parent: scopeRef });
					for (let i = 0; i < parameters.length; i++)
						scope.define(parameters[i], args[i]);
					return this.withScope(scope, () => this.evaluateAll(statements));
				};
				this.scope.define(name, fn);
			},
			macro: (name, parameters, ...statements) => {
				const scopeRef = this.scope;
				const fn = (...args) => {
					const scope = new Scope({ parent: scopeRef });
					for (let i = 0; i < parameters.length; i++)
						scope.define(parameters[i], args[i]);
					return this.withScope(scope, () => this.evaluateAll(statements));
				};
				this.scope.define(name, fn);
				this.scope.registerMacro(fn);
			},
			while: (condition, ...statements) => {
				let value;
				while (this.evaluate(condition)) value = this.evaluateAll(statements);
				return value;
			},
			loop: ([index, start, end, step], ...statements) => {
				const scope = new Scope({ parent: this.scope });
				scope.define(index);
				return this.withScope(scope, () => {
					let value;
					for (
						let i = this.evaluate(start);
						i <= this.evaluate(end);
						i += this.evaluate(step ?? 1)
					) {
						this.scope.assign(index, i);
						value = this.evaluateAll(statements);
					}
					return value;
				});
			},
		},
	});

	constructor() {
		this.scope = this.globalScope;
	}

	/**
	 * Runs a callback with a substituted scope;
	 * @param {Scope} scope
	 * @param {function} callback
	 * @return {any}
	 */
	withScope(scope, callback) {
		const oldScope = this.scope;
		this.scope = scope;
		const value = callback();
		this.scope = oldScope;
		return value;
	}

	/**
	 * Throws an error
	 * @param {string} message - Message to show
	 * @param {any} statement - Statement that causes the error
	 */
	error(message, statement) {
		throw `[${statement}]: ${message}`;
	}

	/**
	 * Evaluates a given statement
	 * @param {any} statement - Statement to evaluate
	 * @return {any}
	 */
	evaluate(statement) {
		if (typeof statement === "string") {
			if (this.scope.has(statement)) return this.scope.get(statement);
			return this.error("Not Defined", statement);
		}

		if (Array.isArray(statement)) {
			if (!statement.length) return this.error("Empty List", statement);
			const [call, ...args] = statement;
			const fn = this.evaluate(call);
			if (typeof fn !== "function") return this.error("Call is not a function", statement);
			if (this.scope.isMacro(fn)) return fn(...args);
			return fn(...args.map((e) => this.evaluate(e)));
		}
		return statement;
	}

	/**
	 * Evaluates a list of statements
	 * @param {any[]} statements - Statements to evaluate
	 * @return {any}
	 */
	evaluateAll(statements) {
		let value;
		for (const statement of statements) value = this.evaluate(statement);
		return value;
	}
}
