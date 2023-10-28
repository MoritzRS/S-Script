export class Scope {
	public parent: Scope | undefined = undefined;

	public variables = new Map<string, unknown>();
	public constants = new Map<string, unknown>();
	public builtIns = new Map<string, unknown>();

	constructor({
		parent,
		variables,
		constants,
		builtIns,
	}: {
		parent?: Scope;
		variables?: Record<string, unknown>;
		constants?: Record<string, unknown>;
		builtIns?: Record<string, unknown>;
	}) {
		if (parent) this.parent = parent;
		if (variables) for (const key in variables) this.defineVariable(key, variables[key]);
		if (constants) for (const key in constants) this.defineConstant(key, constants[key]);
		if (builtIns) for (const key in builtIns) this.defineBuiltIn(key, builtIns[key]);
	}

	/** Checks if a variable exists in the scope */
	public exists(key: string) {
		if (this.variables.has(key)) return true;
		if (this.constants.has(key)) return true;
		if (this.builtIns.has(key)) return true;
		if (this.parent) return this.parent.exists(key);
		return false;
	}

	/** Deletes variable */
	public delete(key: string) {
		if (this.variables.has(key)) this.variables.delete(key);
		else if (this.constants.has(key)) this.constants.delete(key);
		else if (this.builtIns.has(key)) this.builtIns.delete(key);
		else if (this.parent) this.parent.delete(key);
	}

	public get(key: string) {
		if (this.variables.has(key)) return this.variables.get(key);
		if (this.constants.has(key)) return this.constants.get(key);
		if (this.constants.has(key)) return this.constants.get(key);
		if (this.builtIns.has(key)) return this.builtIns.get(key);
		if (this.parent) return this.parent.get(key);
		return undefined;
	}

	public defineVariable(key: string, value?: unknown) {
		if (this.variables.has(key)) throw `"${key}" is already defined`;
		else if (this.constants.has(key)) throw `"${key}" is already defined`;
		else if (this.builtIns.has(key)) throw `"${key}" is already defined`;
		this.variables.set(key, value);
		return value;
	}

	public defineConstant(key: string, value: unknown) {
		if (this.constants.has(key)) throw `"${key}" is already defined`;
		else if (this.variables.has(key)) throw `"${key}" is already defined`;
		else if (this.builtIns.has(key)) throw `"${key}" is already defined`;
		this.constants.set(key, value);
		return value;
	}

	public defineBuiltIn(key: string, value: unknown) {
		if (this.builtIns.has(key)) throw `"${key}" is already defined`;
		else if (this.variables.has(key)) throw `"${key}" is already defined`;
		else if (this.constants.has(key)) throw `"${key}" is already defined`;
		this.builtIns.set(key, value);
		return value;
	}

	public assign(key: string, value: unknown) {
		if (this.variables.has(key)) this.variables.set(key, value);
		else if (this.constants.has(key)) throw `Cannot assign new value to constant "${key}"`;
		else if (this.builtIns.has(key)) throw `Cannot override builtin "${key}"`;
		else if (this.parent) this.parent.assign(key, value);
		else throw `"${key}" is not defined`;
		return value;
	}
}
