# S-Script

S-Expression interpreter written in Javascript.
Inspired by Lisp.
100% Test Coverage.

## Why S-Expressions?

S-Expressions are simple to parse and elegant.
The AST of S-Expressions are basically identical to their raw form.
The parser implements some additional features like quotes strings or object accessors, but apart from that it is really simple.
Also extending the language can be done in a really simple way, even at runtime, using macros.

# Features

-   [x] Instruction Interpreter
-   [x] Parser for S-Expressions
-   [x] Proper Scoping
-   [x] 100% Test Coverage
-   [x] Zero (0) Dependencies

# Usage

This package exports two function: `parse` and `evaluate`.
You can use them like so:

```js
const script = "(+ 1 2 3)";
const ast = parse(script);
const result = evaluate(ast); // 6
```

You can inject memory and macros during the evaluation phase.

```js
const content = {
	x: 1,
	y: 2,
};

const macros = {
	log: (...args) => console.log(args),
};

const script = "(log x y)";
const ast = parse(script);
const result = evaluate(ast, { memory, macros }); // logs to console
```

# Core Features and Functions

## Parser Shortcuts

| Name | Example            | Description                      |
| ---- | ------------------ | -------------------------------- |
| `'`  | `(print '(1 2 3))` | Quotes a list                    |
| `.`  | `(* x.value 2)`    | Shortcut for get (object access) |

## Macros

| Name       | Example                              | Description                                                              |
| ---------- | ------------------------------------ | ------------------------------------------------------------------------ |
| `quote`    | `(quote (1 2 3))`                    | Returns its parameter as raw value                                       |
| `let`      | `(let ((x 2)) (* x 2))`              | Creates a scope with variables and evaluates the given statements        |
| `define`   | `(define x 123)`                     | Defines a variable in the current scope                                  |
| `assign`   | `(assign x 456)`                     | Changes the value of a variable in the current scope                     |
| `object`   | `(object (x 123) (y 456))`           | Creates a new object with properties                                     |
| `if`       | `(if (false 123) (true 456))`        | Runs the first statement where a condition is met                        |
| `lambda`   | `(lambda (x) (* x 2))`               | Creates an anonymous function and returns it                             |
| `function` | `(function double (x) (* x 2))`      | Creates a named function                                                 |
| `macro`    | `(macro raw (x) (quote x))`          | Creates a named macro                                                    |
| `while`    | `(while (< x 3) (assign x (+ x 1)))` | Runs statements in loop as long as a condition is met                    |
| `loop`     | `(loop (i 0 3 1) (* i 2))`           | Runs statements in a for loop with index i, from i=0 while i<=3 and i+=1 |

## Numeric Functions

| Name  | Example       | Description                            |
| ----- | ------------- | -------------------------------------- |
| `+`   | `(+ 1 2 3)`   | Adds numbers                           |
| `-`   | `(- 6 3 2)`   | Subtracts numbers                      |
| `*`   | `(* 2 2 3)`   | Multiplicates numbers                  |
| `/`   | `(/ 20 10 2)` | Divides numbers                        |
| `%`   | `(% 10 6)`    | Performs modulo on numbers             |
| `**`  | `(** 2 3)`    | Potentiates numbers                    |
| `&`   | `(& 1 2)`     | Performs bitwise and on numbers        |
| `\|`  | `(\| 1 2)`    | Performs bitwise or on nummbers        |
| `min` | `(min 1 2 3)` | Returns the smalles number             |
| `max` | `(max 1 2 3)` | Returns the largest number             |
| `abs` | `(abs -10)`   | Returns the absolute value of a number |
| `sin` | `(sin 1)`     | Returns sin of a number                |
| `cos` | `(cos 1)`     | Returns the cosin of a number          |
| `tan` | `(tan 1)`     | Returns the tan of a number            |
| `PI`  | `PI`          | Mathematical constant PI               |
| `E`   | `E`           | Mathematical constant E                |

## Logic Functions

| Name  | Example                  | Description                                                      |
| ----- | ------------------------ | ---------------------------------------------------------------- |
| `!`   | `(! true)`               | Returns the inverse boolean value                                |
| `not` | `(not false true false)` | Performs logical inversion on its given values                   |
| `and` | `(and true true)`        | Performs logical and on its given values                         |
| `or`  | `(or true false)`        | Performs logical or on its given values                          |
| `=`   | `(= 123 123)`            | Checks if all given values are equal                             |
| `!=`  | ```(!= 123 456)          | Checks if none of the given values are equal                     |
| `>`   | `(> 3 2 1)`              | Checks if its given values are in descending order (no equals)   |
| `>=`  | `(>= 3 2 2)`             | Checks if its given values are in descending order (with equals) |
| `<`   | `(< 1 2 3)`              | Checks if its given values are in ascending order (no equals)    |
| `<=`  | `(<= 1 2 2)`             | Checks if its given values are in ascending order (with equals)  |

## Value Functions

| Name      | Example             | Description                      |
| --------- | ------------------- | -------------------------------- |
| `number`  | `(number "123")`    | Converts a value to a number     |
| `boolean` | `(boolean 1)`       | Converts a value to a boolean    |
| `list`    | `(list 1 2 3)`      | Creates a list out of its values |
| `string`  | `(string 123)`      | Converts a value to a string     |
| `new`     | `(new myClass 123)` | Instantiates a new class object  |

## List Functions

| Name      | Example                                      | Description                                                         |
| --------- | -------------------------------------------- | ------------------------------------------------------------------- |
| `first`   | `(first '(1 2 3))`                           | Returns the first value from a given list                           |
| `last`    | `(last '(1 2 3))`                            | Returns the last value from a given list                            |
| `rest`    | `(rest '(1 2 3))`                            | Returns a given list without its first value                        |
| `reverse` | `(reverse '(3 2 1))`                         | Returns the reverse of a given list                                 |
| `append`  | `(append '(1 2 3) '(4 5 6))`                 | Append the given lists                                              |
| `map`     | `(map '(1 2 3) (lambda (x) (* x 2)))`        | Returns a new list by performing a given mapping function on a list |
| `reduce`  | `(reduce '(1 2 3) (lambda (a b) (+ a b)) 0)` | Reduces a list down to a single value using a function              |

## String Functions

| Name   | Example                       | Description                               |
| ------ | ----------------------------- | ----------------------------------------- |
| `join` | `(join ", " "Hello" "World")` | Joins its given strings using a seperator |

## Object Functions

| Name     | Example             | Description                                          |
| -------- | ------------------- | ---------------------------------------------------- |
| `get`    | `(get x "a")`       | Returns a given property of a given object           |
| `set`    | `(set x "a" 123)`   | Sets the value of a given property on a given object |
| `keys`   | `(keys myObject)`   | Returns a list of property keys for a given object   |
| `values` | `(values myObject)` | Returns a list of property values for a given object |

## Function Calling

| Name    | Example                     | Description                                                 |
| ------- | --------------------------- | ----------------------------------------------------------- |
| `eval`  | `(eval '(+ 1 2))`           | Evaluates its given statements                              |
| `bind`  | `(bind myFuncion myObject)` | Binds a new this context on a given function and returns it |
| `call`  | `(call myFunc 1 2 3)`       | Calls a given function with given parameters                |
| `apply` | `(apply myFunc '(1 2 3))`   | Calls a given function with a list of parameters            |

## Debugging Functions

| Name    | Example                 | Description                        |
| ------- | ----------------------- | ---------------------------------- |
| `type`  | `(type 123)`            | Returns the type of a value        |
| `print` | `(print "Hello World")` | Prints the given values to console |
