import { completion, config, language } from "../src/integrations/monaco";
import { Interpreter } from "../src/interpreter";
import { core } from "../src/modules/core";
import { math } from "../src/modules/math";
import { Parser } from "../src/parser";
import { Token } from "../src/token";
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

let timeout: ReturnType<typeof setTimeout>;
editor.getModel().onDidChangeContent(() => {
	clearTimeout(timeout);
	timeout = setTimeout(() => {
		const content = editor.getValue();
		localStorage.setItem("monaco-content", content);
		let ast: Token[];
		try {
			const parser = new Parser();
			ast = parser.parse(content);
			monaco.editor.setModelMarkers(editor.getModel(), "custom", []);
			astContainer.innerText = JSON.stringify(ast, null, 4);
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
		const content = editor.getValue();
		localStorage.setItem("monaco-content", content);
		let ast: Token[];
		try {
			const parser = new Parser();
			ast = parser.parse(content);
			monaco.editor.setModelMarkers(editor.getModel(), "custom", []);
			astContainer.innerText = JSON.stringify(ast, null, 4);
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
