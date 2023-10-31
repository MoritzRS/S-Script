import { Token } from "../src/token";

export function createExplorer(ast: Token[]) {
	const container = document.createElement("div");
	container.classList.add("ast-explorer");
	for (const token of ast) container.appendChild(createToken(token));
	return container;
}

function enter(token: Token) {
	window.dispatchEvent(new CustomEvent("selectToken", { detail: token }));
}

function leave() {
	window.dispatchEvent(new CustomEvent("unselectToken"));
}

function createToken(token: Token) {
	const container = document.createElement("div");
	container.classList.add("token");
	container.addEventListener("pointerenter", () => {
		enter(token);
	});

	container.addEventListener("pointerleave", () => {
		leave();
	});

	// name
	const name = document.createElement("div");
	name.innerText = token.type;
	container.appendChild(name);

	// raw
	const raw = document.createElement("div");
	raw.classList.add("token-raw");

	const rawLabel = document.createElement("div");
	rawLabel.innerText = "raw:";
	raw.appendChild(rawLabel);

	const rawContent = document.createElement("pre");
	rawContent.innerText = "'" + token.raw + "'";
	raw.appendChild(rawContent);

	container.appendChild(raw);

	// value
	const value = document.createElement("div");
	value.classList.add("token-value");

	const valueLabel = document.createElement("div");
	valueLabel.innerText = "value:";
	value.appendChild(valueLabel);

	const valueContent = document.createElement("div");
	valueContent.classList.add("token-value-content");
	if (token.type === "list") valueContent.append(...token.value.map((e) => createToken(e)));
	else valueContent.innerText = token.value as any;
	value.appendChild(valueContent);

	container.appendChild(value);

	return container;
}
