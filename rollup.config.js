const {esm, umds} = require("./rollup/config");

export default [
	...umds({
		input: "src/index.umd.js",
		library: "eg.Persist",
		outputs: [
			"./dist/persist.js",
			"./dist/persist.min.js",
		],
	}),
	...umds({
		input: "src/persist-migrate.js",
		library: "eg.Persist",
		outputs: [
			"./dist/persist-migrate.js",
			"./dist/persist-migrate.min.js",
		],
	}),
	esm({
		input: "./src/Persist.js",
		output: "./dist/persist.esm.js",
	}),
];
