import { Module } from "../module";

export const math: Module = {
	variables: {
		"+": (...values: number[]) => values.reduce((a, b) => a + b),
		"-": (...values: number[]) => values.reduce((a, b) => a - b),
		"*": (...values: number[]) => values.reduce((a, b) => a * b),
		"/": (...values: number[]) => values.reduce((a, b) => a / b),
		"%": (...values: number[]) => values.reduce((a, b) => a % b),
		pow: (...values: number[]) => values.reduce((a, b) => a ** b),
		"<<": (...values: number[]) => values.reduce((a, b) => a << b),
		">>": (...values: number[]) => values.reduce((a, b) => a >> b),
		"&": (...values: number[]) => values.reduce((a, b) => a & b),
		"|": (...values: number[]) => values.reduce((a, b) => a | b),
		round: (value: number) => Math.round(value),
		floor: (value: number) => Math.floor(value),
		ceil: (value: number) => Math.ceil(value),
	},
	constants: {
		PI: Math.PI,
		E: Math.E,
	},
};
