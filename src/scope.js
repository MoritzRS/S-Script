export class Scope {
	/** @type {Scope} */
	parent = undefined;

	/** @type {Map} */
	content = new Map();

	/** @type {Set} */
	macros = new Set();

	/**
	 * @param {{parent?: Scope, content?: Object.<string,any>, macros?: Object.<string,Function>}} options
	 */
	constructor({ parent, content, macros } = {}) {
		if (parent) this.parent = parent;
		if (content) for (const key in content) this.content.set(key, content[key]);
		if (macros)
			for (const key in macros) {
				this.content.set(key, macros[key]);
				this.macros.add(macros[key]);
			}
	}

	/**
	 * Defines a new entry in the scope
	 * @param {string} name
	 * @param {any} value
	 */
	define(name, value = undefined) {
		if (this.content.has(name)) throw `${name} is already defined`;
		this.content.set(name, value);
	}

	/**
	 * Registers a function as macor
	 * @param {any} value
	 */
	registerMacro(value) {
		this.macros.add(value);
	}

	/**
	 * Assigns a new value to a scope entry
	 * @param {string} name
	 * @param {any} value
	 */
	assign(name, value) {
		if (this.content.has(name)) this.content.set(name, value);
		else if (this.parent) this.parent.assign(name, value);
		else throw `${name} is not defined`;
	}

	/**
	 * Gets the value of a variable
	 * @param {string} name
	 */
	get(name) {
		if (this.content.has(name)) return this.content.get(name);
		else if (this.parent) return this.parent.get(name);
		else throw `${name} is not defined`;
	}

	/**
	 * Checks if a variable exists in the scope
	 * @param {string} name
	 * @return {boolean}
	 */
	has(name) {
		if (this.content.has(name)) return true;
		else if (this.parent) return this.parent.has(name);
		else return false;
	}

	/**
	 * Checks if a value is registered as a macro
	 * @param {any} value
	 * @return {boolean}
	 */
	isMacro(value) {
		if (this.macros.has(value)) return true;
		else if (this.parent) return this.parent.isMacro(value);
		else return false;
	}
}
