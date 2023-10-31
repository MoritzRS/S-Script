import { Identifier, List, Position, Token, Value, Comment } from "./token";
import {
	COMMENT_CLOSE,
	COMMENT_OPEN,
	EOF,
	LIST_CLOSE,
	LIST_OPEN,
	SPACE,
	STRING_CLOSE,
	STRING_OPEN,
	SYMBOL,
} from "./rules";

export class Parser {
	public source: string;
	public index: number;
	public line: number;
	public column: number;

	public error(message: string) {
		throw {
			line: this.line,
			column: this.column,
			position: this.index,
			message,
		};
	}

	public peak(): string {
		return this.source[this.index] ?? "";
	}

	public consume(): string {
		if (this.index >= this.source.length) return "";
		let content = this.source[this.index];
		this.index += 1;
		this.column += 1;

		if (content === "\r") {
			if (this.peak() === "\n") {
				content += this.source[this.index];
				this.index += 1;
			}
			this.line += 1;
			this.column = 1;
		} else if (content === "\n") {
			this.line += 1;
			this.column = 1;
		}

		return content;
	}

	public createToken(creator: () => Value | Identifier | List | Comment): Token {
		const start: Position = [this.line, this.column, this.index];
		const info = creator();
		const end: Position = [this.line, this.column, this.index];
		return {
			start,
			end,
			raw: this.source.substring(start[2], end[2]),
			...info,
		};
	}

	parse_list() {
		return this.createToken(() => {
			this.consume();
			let items = [];
			while (!LIST_CLOSE.test(this.peak())) {
				if (EOF.test(this.peak())) this.error("Unexpected End of List");
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
			this.consume();
			let value = "";
			while (!STRING_CLOSE.test(this.peak())) {
				const current = this.consume();
				if (EOF.test(current)) this.error("Unexpected End of String");
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

	parse_symbol() {
		return this.createToken(() => {
			let content = "";
			while (SYMBOL.test(this.peak())) content += this.consume();

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
			while (!COMMENT_CLOSE.test(current)) {
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
		while (SPACE.test(this.peak())) this.consume();

		const current = this.peak();
		let expression: Token;

		if (LIST_OPEN.test(current)) expression = this.parse_list();
		else if (COMMENT_OPEN.test(current)) expression = this.parse_comment();
		else if (STRING_OPEN.test(current)) expression = this.parse_string();
		else if (SYMBOL.test(current)) expression = this.parse_symbol();
		else this.error("Unexpected character");

		while (SPACE.test(this.peak())) this.consume();
		return expression;
	}

	parse(content: string): Token[] {
		this.source = content;
		this.index = 0;
		this.line = 1;
		this.column = 1;
		const tokens: Token[] = [];
		while (!EOF.test(this.peak())) {
			const token = this.parse_expression();
			if (token.type !== "comment") tokens.push(token);
		}
		return tokens;
	}
}
