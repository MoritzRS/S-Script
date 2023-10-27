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

	/** Spaces */
	SPACE: /^\s/,

	/** End of input */
	END: /^$/,
};
