/**
 * Describes a position in the source.
 * Lines and columns start at 1, index at 0
 */
export type Position = [line: number, column: number, index: number];

/**
 * Possible Token Types.
 * Quite a limited amount
 */
export type Type = "value" | "identifier" | "list" | "comment";

/**
 * Every Tokens contains information about its source code
 */
export type Base = {
	start: Position;
	end: Position;
	raw: string;
	type: Type;
};

/**
 * Values can be numbers, string, etc...
 */
export type Value = {
	type: "value";
	value: unknown;
};

/**
 * Identifiers reference values in the memory by a string key
 */
export type Identifier = {
	type: "identifier";
	value: string;
};

/**
 * Lists contain other Tokens
 */
export type List = {
	type: "list";
	value: Token[];
};

/**
 * Comments only contain a string.
 * They get filtered out during parsing
 */
export type Comment = {
	type: "comment";
	value: string;
};

export type Token = (Base & Value) | (Base & Identifier) | (Base & List) | (Base & Comment);
