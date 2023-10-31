import { Module } from "../module";

export const math: Module = {
	variables: {
		// Calculations
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

		// Comparison
		"<": (current: number, ...values: number[]) => {
			if (!values?.length) return true;
			for (const value of values) {
				if (current >= value) return false;
				current = value;
			}
			return true;
		},
		"<=": (current: number, ...values: number[]) => {
			if (!values?.length) return true;
			for (const value of values) {
				if (current > value) return false;
				current = value;
			}
			return true;
		},
		">": (current: number, ...values: number[]) => {
			if (!values?.length) return true;
			for (const value of values) {
				if (current <= value) return false;
				current = value;
			}
			return true;
		},
		">=": (current: number, ...values: number[]) => {
			if (!values?.length) return true;
			for (const value of values) {
				if (current < value) return false;
				current = value;
			}
			return true;
		},
	},
	constants: {
		PI: Math.PI,
		E: Math.E,
	},
};
