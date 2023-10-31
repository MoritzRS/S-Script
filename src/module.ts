import { Interpreter } from "./interpreter";
import { Token } from "./token";

export type Module = {
	variables?: Record<string, unknown>;
	constants?: Record<string, unknown>;
	macros?: Record<string, (this: Interpreter, ...args: Token[]) => unknown>;
};
