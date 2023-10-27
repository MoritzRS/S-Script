export type TokenType =
	/** Variable Identifier */
	| "identifier"

	/** Raw Values */
	| "value"

	/** List calls (function calls) */
	| "list";

export class Token {
	public start: [number, number, number];
	public end: [number, number, number];
	public raw: string;
	public type: TokenType;
	public value: unknown;

	constructor({
		start,
		end,
		raw,
		type,
		value,
	}: {
		start: [number, number, number];
		end: [number, number, number];
		raw: string;
		type: TokenType;
		value: unknown;
	}) {
		this.start = start;
		this.end = end;
		this.raw = raw;
		this.type = type;
		this.value = value;
	}
}
