/** Marks a space */
export const SPACE = /\s/;
/** Marks the end of a source file */
export const EOF = /^$/;

/** Marks the begin of a list */
export const LIST_OPEN = /\(/;
/** Marks the end of a list */
export const LIST_CLOSE = /\)/;

/** Marks the begin of a string */
export const STRING_OPEN = /"/;
/** Marks the end of a string */
export const STRING_CLOSE = /"/;

/** Marks the begin of a comment */
export const COMMENT_OPEN = /;/;
/** Marks the end of a comment */
export const COMMENT_CLOSE = /(\n|\r|\r\n)/;

/** Marks a symbol (value or identifier) */
export const SYMBOL = /[^\(\)\;\"\s]/;
