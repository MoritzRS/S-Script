import "./worker";
import * as monaco from "monaco-editor";
import { Parser } from "../src/parser/parser";

const content = localStorage.getItem("monaco-content") ?? "";

const editorContainer = document.getElementById("editor") as HTMLDivElement;
const astContainer = document.getElementById("ast") as HTMLPreElement;
const evaluationContainer = document.getElementById("evaluation") as HTMLPreElement;

const editor = monaco.editor.create(editorContainer, {
	theme: "vs-dark",
	fontSize: 24,
	value: content,
	automaticLayout: true,
});

editor.addAction({
	id: "evaluate",
	label: "Evaluate Script",
	keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
	run: function () {
		const content = editor.getValue();
		localStorage.setItem("monaco-content", content);
		try {
			const parser = new Parser();
			const ast = parser.parse(content);
			monaco.editor.setModelMarkers(editor.getModel(), "custom", []);
			astContainer.innerText = JSON.stringify(ast, null, 4);
		} catch (e) {
			monaco.editor.setModelMarkers(editor.getModel(), "custom", [
				{
					startLineNumber: e.line + 1,
					endLineNumber: e.line + 1,
					startColumn: e.column + 1,
					endColumn: e.column + 1,
					message: e.message,
					severity: monaco.MarkerSeverity.Error,
				},
			]);
			astContainer.innerText = JSON.stringify(e);
		}
	},
});
