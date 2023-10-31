import { Module } from "../module";

export const list: Module = {
	variables: {
		list: (...values: unknown[]) => values,
		first: (values: unknown[]) => values.at(0),
		last: (values: unknown[]) => values.at(-1),
		rest: (values: unknown[]) => values.slice(1),
		slice: (values: unknown[], start: number, end: number) => values.slice(start, end),
		reverse: (values: unknown[]) => values.slice(0).reverse(),
		append: (...values: unknown[][]) => values.flat(),
		join: (values: unknown[], separator: string) => values.join(separator),
		map: (values: unknown[], fn: (e: unknown, i: number, a: unknown[]) => unknown) =>
			values.map(fn),
		reduce: (
			values: unknown[],
			fn: (carry: unknown, current: unknown) => unknown,
			initial: unknown,
		) => values.reduce(fn, initial),
	},
};
