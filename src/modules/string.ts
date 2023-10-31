import { Module } from "../module";

export const string: Module = {
	variables: {
		string: (value: unknown) => new String(value),
		split: (value: string, separator: string) => value.split(separator),
		char: (value: string, position: number) => value.at(position),
		lower: (value: string) => value.toLowerCase(),
		upper: (value: string) => value.toUpperCase(),
		trim: (value: string) => value.trim(),
		replace: (value: string, search: string, replace: string) => value.replace(search, replace),
	},
};
