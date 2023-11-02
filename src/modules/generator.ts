import { Module } from "../module";
import { Scope } from "../scope";

export const generator: Module = {
	variables: {
		add: function* (...values) {
			yield values.reduce((a, b) => a + b);
		},
	},

	macros: {
		var: function* (identifier, ...values) {
			const name = identifier.value as string;
			let value: unknown;
			for (let element of this.evaluateAll(values)) {
				value = element;
				yield element;
			}
			this.scope.defineVariable(name, value);
		},
		lambda: function* (params, ...values) {
			const scopeRef = this.scope;
			yield function* (...args) {
				const scope = new Scope({ parent: scopeRef });
				for (let i = 0; i < params.value.length; i++)
					scope.defineVariable(params.value[i].value, args[i]);
				this.scope = scope;
				for (const element of this.evaluateAll(values)) yield element;
				this.scope = scopeRef;
			}.bind(this);
		},
	},
};
