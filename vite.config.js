import { defineConfig } from "vite";

export default defineConfig({
	root: "test",
	test: {
		coverage: {
			enabled: true,
			provider: "v8",
		},
	},
});
