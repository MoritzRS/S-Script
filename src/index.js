import { Interpreter } from "./interpreter";
import { Parser } from "./parser";

/**
 * Evaluates a set of instructions
 * @param {any[]} ast - AST set of instructions
 * @param {{content?: Object.<string, any>, macros?: Object.<string,Function>}?} injection - values and functions to inject
 * @return {any}
 */
export function evaluate(ast, injection) {
	const interpreter = new Interpreter();
	if (injection) {
		const { content, macros } = injection;
		if (content) for (const key in content) interpreter.scope.define(key, content[key]);
		if (macros)
			for (const key in macros) {
				interpreter.scope.define(key, macros[key]);
				interpreter.scope.registerMacro(macros[key]);
			}
	}
	return interpreter.evaluateAll(ast);
}

/**
 * Parses S-Expression Syntax into AST
 * @param {string} source - S-Expressions to parse
 * @return {any[]}
 */
export function parse(source) {
	const parser = new Parser();
	return parser.parse(source);
}
