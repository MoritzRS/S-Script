import { completion, config, language } from "../src/integrations/monaco";
import { Interpreter } from "../src/interpreter";
import { core } from "../src/modules/core";
import { list } from "../src/modules/list";
import { math } from "../src/modules/math";
import { string } from "../src/modules/string";
import { Parser } from "../src/parser";
import { Token } from "../src/token";
import { createExplorer } from "./explorer";
import "./worker";
import * as monaco from "monaco-editor";

const content = localStorage.getItem("monaco-content") ?? "";

const editorContainer = document.getElementById("editor") as HTMLDivElement;
const astContainer = document.getElementById("ast") as HTMLPreElement;
const evaluationContainer = document.getElementById("evaluation") as HTMLPreElement;

monaco.languages.register({ id: "custom" });
monaco.languages.setMonarchTokensProvider("custom", language);
monaco.languages.setLanguageConfiguration("custom", config);
monaco.languages.registerCompletionItemProvider("custom", completion);

const editor = monaco.editor.create(editorContainer, {
	theme: "vs-dark",
	fontSize: 24,
	value: content,
	language: "custom",
	automaticLayout: true,
});

let decorations = editor.createDecorationsCollection([]);
const highlightTokens: Token[] = [];

function decorate() {
	decorations.clear();
	const token = highlightTokens.at(-1);
	if (!token) return;
	decorations.set([
		{
			range: new monaco.Range(token.start[0], token.start[1], token.end[0], token.end[1]),
			options: { className: "selected-token" },
		},
	]);
}

function clearDecoration() {
	while (highlightTokens.length) highlightTokens.pop();
	decorate();
}

window.addEventListener("selectToken", ({ detail }: CustomEvent) => {
	highlightTokens.push(detail);
	decorate();
});

window.addEventListener("unselectToken", () => {
	highlightTokens.pop();
	decorate();
});

let timeout: ReturnType<typeof setTimeout>;
let explorer: HTMLElement;
editor.getModel().onDidChangeContent(() => {
	clearTimeout(timeout);
	clearDecoration();
	timeout = setTimeout(() => {
		const content = editor.getValue();
		localStorage.setItem("monaco-content", content);
		let ast: Token[];
		try {
			const parser = new Parser();
			ast = parser.parse(content);
			monaco.editor.setModelMarkers(editor.getModel(), "custom", []);
			explorer?.remove();
			explorer = createExplorer(ast);
			astContainer.appendChild(explorer);
		} catch (e) {
			monaco.editor.setModelMarkers(editor.getModel(), "custom", [
				{
					startLineNumber: e.line + 1,
					endLineNumber: e.line + 1,
					startColumn: e.column + 1,
					endColumn: e.column + 2,
					message: e.message,
					severity: monaco.MarkerSeverity.Error,
				},
			]);
			astContainer.innerText = JSON.stringify(e);
		}
	}, 750);
});

editor.addAction({
	id: "evaluate",
	label: "Evaluate Script",
	keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
	run: function () {
		clearTimeout(timeout);
		clearDecoration();
		const content = editor.getValue();
		localStorage.setItem("monaco-content", content);
		let ast: Token[];
		try {
			const parser = new Parser();
			ast = parser.parse(content);
			monaco.editor.setModelMarkers(editor.getModel(), "custom", []);
			explorer?.remove();
			explorer = createExplorer(ast);
			astContainer.appendChild(explorer);
		} catch (e) {
			monaco.editor.setModelMarkers(editor.getModel(), "custom", [
				{
					startLineNumber: e.line,
					endLineNumber: e.line,
					startColumn: e.column,
					endColumn: e.column + 1,
					message: e.message,
					severity: monaco.MarkerSeverity.Error,
				},
			]);
			astContainer.innerText = JSON.stringify(e);
		}

		try {
			const interpreter = new Interpreter();
			interpreter.loadModule(core);
			interpreter.loadModule(math);
			interpreter.loadModule(list);
			interpreter.loadModule(string);
			const result = interpreter.run(ast ?? []);
			evaluationContainer.innerText = JSON.stringify(result);
		} catch (e) {
			monaco.editor.setModelMarkers(editor.getModel(), "custom", [
				{
					startLineNumber: e.start[0],
					endLineNumber: e.end[0],
					startColumn: e.start[1],
					endColumn: e.end[1],
					message: e.message,
					severity: monaco.MarkerSeverity.Error,
				},
			]);
			evaluationContainer.innerText = JSON.stringify(e);
		}
	},
});
