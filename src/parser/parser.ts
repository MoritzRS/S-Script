import { Token, TokenType } from "../token/tokens";

export const RULES = {
	/** Marks the begin of a list */
	LIST_OPEN: /^\(/,

	/** Marks the end of a list */
	LIST_CLOSE: /^\)/,

	/** Marks the begin and end of a string */
	STRING_DELIMITER: /^\"/,

	/** Marks the begin of a quotation */
	QUOTATION_MARK: /^\'/,

	/** Any character that is allowed in atoms */
	ATOM_CHARACTER: /^[^\(\)\"\'\s]/,

	/** Marks the Begin of a comment */
	COMMENT_START: /^;/,

	/** Marks the end of a comment */
	COMMENT_END: /^(\n|\r|\r\n|$)/,

	/** Spaces */
	SPACE: /^\s/,

	/** End of input */
	END: /^$/,
};

export class Parser {
	public source: string;
	public position: number;
	public line: number;
	public column: number;

	public error(message: string) {
		throw {
			line: this.line,
			column: this.column,
			position: this.position,
			message,
		};
	}

	public peak(n = 0): string {
		return this.source[this.position + n] ?? "";
	}

	public consume(): string {
		if (this.position >= this.source.length) return "";
		let content = this.source[this.position];
		this.position += 1;
		this.column += 1;

		if (content === "\r") {
			if (this.peak() === "\n") {
				content += this.source[this.position];
				this.position += 1;
			}
			this.line += 1;
			this.column = 0;
		} else if (content === "\n") {
			this.line += 1;
			this.column = 0;
		}

		return content;
	}

	public createToken(creator: () => { type: TokenType; value?: unknown | Token[] }) {
		const start: [number, number, number] = [this.line, this.column, this.position];
		const { value, type } = creator();
		const end: [number, number, number] = [this.line, this.column, this.position];
		return new Token({
			start,
			end,
			raw: this.source.substring(start[2], end[2]),
			value,
			type,
		});
	}

	parse_list() {
		return this.createToken(() => {
			this.consume();
			let items = [];
			while (!RULES.LIST_CLOSE.test(this.peak())) {
				if (RULES.END.test(this.peak())) this.error("Unexpected List ending");
				const token = this.parse_expression();
				if (token.type !== "comment") items.push(token);
			}
			this.consume();
			return {
				type: "list",
				value: items,
			};
		});
	}

	parse_string() {
		return this.createToken(() => {
			const delimiter = this.consume();
			let value = "";
			while (this.peak() !== delimiter) {
				const current = this.consume();
				if (RULES.END.test(current)) this.error("Unexpected End of String");
				value += current;
				if (current === "\\") value += this.consume();
			}
			this.consume();
			return {
				type: "value",
				value: value,
			};
		});
	}

	parse_atom() {
		return this.createToken(() => {
			let content = "";
			while (RULES.ATOM_CHARACTER.test(this.peak())) content += this.consume();

			if (content === "true") return { type: "value", value: true };
			if (content === "false") return { type: "value", value: false };
			if (content === "null") return { type: "value", value: null };
			if (content === "undefined") return { type: "value", value: undefined };

			// numbers
			const numeric = Number(content);
			if (!isNaN(numeric))
				return {
					type: "value",
					value: numeric,
				};

			// identifier
			return { type: "identifier", value: content };
		});
	}

	parse_comment() {
		return this.createToken(() => {
			this.consume();
			let content = "";
			let current = this.consume();
			while (!RULES.COMMENT_END.test(current)) {
				content += current;
				current = this.consume();
			}
			return {
				type: "comment",
				value: content,
			};
		});
	}

	parse_expression() {
		while (RULES.SPACE.test(this.peak())) this.consume();

		const current = this.peak();
		let expression: Token;

		if (RULES.LIST_OPEN.test(current)) expression = this.parse_list();
		else if (RULES.COMMENT_START.test(current)) expression = this.parse_comment();
		else if (RULES.STRING_DELIMITER.test(current)) expression = this.parse_string();
		else if (RULES.ATOM_CHARACTER.test(current)) expression = this.parse_atom();
		else this.error("Unexpected character");

		while (RULES.SPACE.test(this.peak())) this.consume();
		return expression;
	}

	parse(content: string): Token[] {
		this.source = content;
		this.position = 0;
		this.line = 0;
		this.column = 0;
		const tokens: Token[] = [];
		while (!RULES.END.test(this.peak())) {
			const token = this.parse_expression();
			if (token.type !== "comment") tokens.push(token);
		}
		return tokens;
	}
}
