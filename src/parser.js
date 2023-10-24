/**
 * List of used regular expressions
 */
const RULES = {
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

	/** Spaces */
	SPACE: /^\s/,

	/** End of input */
	END: /^$/,
};

/**
 * Parse for S-Expressions
 */
export class Parser {
	/**
	 * Character Stream to parse
	 * @type {string[]}
	 */
	stream = [];

	/**
	 * Current Stream Position
	 * @type {number}
	 */
	position = 0;

	/**
	 * Current Line in source
	 * @type {number}
	 */
	line = 0;

	/**
	 * Current Column in source
	 * @type {number}
	 */
	column = 0;

	/**
	 * Throw error message
	 * @param {string} message
	 */
	error(message) {
		throw `[${this.line}:${this.column}]: ${message}`;
	}

	/**
	 * Peak at the current character
	 * @return {string}
	 */
	peak() {
		return this.stream[this.position] ?? "";
	}

	/**
	 * Take the current character and move on.
	 * @return {string}
	 */
	consume() {
		if (this.position >= this.stream.length) return "";
		let content = this.stream[this.position];
		this.position += 1;
		this.column += 1;

		if (content === "\r") {
			if (this.peak() === "\n") {
				content += this.stream[this.position];
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

	/**
	 * Parses a list like `( ...expressions )`
	 * @return {any[]}
	 */
	parse_list() {
		this.consume();
		let items = [];
		while (!RULES.LIST_CLOSE.test(this.peak())) {
			if (RULES.END.test(this.peak())) this.error("Unexpected List ending");
			items.push(this.parse_expression());
		}
		this.consume();
		return items;
	}

	/**
	 * Parses a string like `"content"`
	 * @return {string}
	 */
	parse_string() {
		const delimiter = this.consume();
		let content = "";
		while (this.peak() !== delimiter) {
			const current = this.consume();
			if (RULES.END.test(current)) this.error("Unexpected End of String");
			content += current;
			if (current === "\\") content += this.consume();
		}
		this.consume();
		return ["quote", content];
	}

	/**
	 * Parses single atom to either a number or a string.
	 * @return {number|string}
	 */
	parse_atom() {
		let content = "";
		while (RULES.ATOM_CHARACTER.test(this.peak())) content += this.consume();

		// numbers
		if (!isNaN(content)) return Number(content);

		// special values
		if (content === "true") return true;
		if (content === "false") return false;
		if (content === "null") return null;
		if (content === "undefined") return undefined;
		if (content === "nan") return NaN;

		// object accessor notation
		if (content.includes(".")) {
			const parts = content.split(".");
			if (parts.includes("")) this.error("Too many dots used");
			const build = (current, ...rest) => {
				if (!rest.length) return current;
				return ["get", build(...rest), ["quote", current]];
			};
			return build(...parts.reverse());
		}

		// variable
		return content;
	}

	/**
	 * Parses a quote like `'expression`
	 * @return {any[]}
	 */
	parse_quote() {
		this.consume();
		if (RULES.LIST_OPEN.test(this.peak())) return ["quote", this.parse_list()];
		else this.error("Unexpected quotation");
	}

	/**
	 * Parses the next expression in the stream
	 * @return {any[]}
	 */
	parse_expression() {
		while (RULES.SPACE.test(this.peak())) this.consume();

		const current = this.peak();
		let expression;

		if (RULES.QUOTATION_MARK.test(current)) expression = this.parse_quote();
		else if (RULES.LIST_OPEN.test(current)) expression = this.parse_list();
		else if (RULES.STRING_DELIMITER.test(current)) expression = this.parse_string();
		else expression = this.parse_atom();

		while (RULES.SPACE.test(this.peak())) this.consume();
		return expression;
	}

	/**
	 * Parse s-expression to javascript array statements
	 * @param {string} content
	 * @return {any[][]}
	 */
	parse(content) {
		this.stream = content.split("");
		this.position = 0;
		this.line = 0;
		this.column = 0;
		const expressions = [];
		while (!RULES.END.test(this.peak())) expressions.push(this.parse_expression());
		return expressions;
	}
}
