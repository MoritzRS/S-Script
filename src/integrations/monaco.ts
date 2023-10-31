import { languages } from "monaco-editor";
import { core } from "../modules/core";

const keywords = Object.keys(core.macros);
const constants = ["true", "false", "null", "undefined"];
const operators = Object.keys(core.variables);

export const completion: languages.CompletionItemProvider = {
	provideCompletionItems: (mode, position, context, token) => {
		const suggestions: languages.CompletionItem[] = [
			...keywords.map(
				(e) =>
					({
						label: e,
						kind: languages.CompletionItemKind.Keyword,
						insertText: e,
					} as any),
			),
			...constants.map(
				(e) =>
					({
						label: e,
						kind: languages.CompletionItemKind.Constant,
						insertText: e,
					} as any),
			),
		];
		return { suggestions };
	},
};

export const config: languages.LanguageConfiguration = {
	comments: { lineComment: ";" },

	brackets: [
		["(", ")"],
		["[", "]"],
	],

	autoClosingPairs: [
		{ open: "(", close: ")" },
		{ open: "[", close: "]" },
		{ open: '"', close: '"' },
	],

	surroundingPairs: [
		{ open: "(", close: ")" },
		{ open: "[", close: "]" },
		{ open: '"', close: '"' },
	],
};

export const language = <languages.IMonarchLanguage>{
	defaultToken: "",
	ignoreCase: false,
	tokenPostfix: ".scheme",

	brackets: [
		{ open: "(", close: ")", token: "delimiter.parenthesis" },
		{ open: "[", close: "]", token: "delimiter.square" },
	],

	keywords,
	constants,
	operators,

	digits: /\d+/,
	octaldigits: /[0-7]+/,
	binarydigits: /[0-1]+/,
	hexdigits: /[[0-9a-fA-F]+/,

	tokenizer: {
		root: [
			[/(@digits)[eE]([\-+]?(@digits))?/, "number.float"],
			[/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, "number.float"],
			[/0[xX](@hexdigits)n?/, "number.hex"],
			[/0[oO]?(@octaldigits)n?/, "number.octal"],
			[/0[bB](@binarydigits)n?/, "number.binary"],
			[/(@digits)n?/, "number"],

			{ include: "@whitespace" },
			{ include: "@strings" },

			[
				/[^\(\)\"\'\s]+/,
				{
					cases: {
						"@keywords": "keyword",
						"@constants": "constant",
						"@operators": "operators",
						"@default": "identifier",
					},
				},
			],
		],

		comment: [
			// [/[^\|#]+/, "comment"],
			// [/#\|/, "comment", "@push"],
			// [/\|#/, "comment", "@pop"],
			// [/[\|#]/, "comment"],
		],

		whitespace: [
			[/[ \t\r\n]+/, "white"],
			// [/#\|/, "comment", "@comment"],
			[/;.*$/, "comment"],
		],

		strings: [
			[/"$/, "string", "@popall"],
			[/"(?=.)/, "string", "@multiLineString"],
		],

		multiLineString: [
			// [/[^\\"]+$/, "string", "@popall"],
			[/[^\\"]+/, "string"],
			[/\\./, "string.escape"],
			[/"/, "string", "@popall"],
			// [/\\$/, "string"],
		],
	},
};
