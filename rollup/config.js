const pluginBabel = require("rollup-plugin-babel");
const pluginReplace = require("rollup-plugin-replace");
const pluginUglify = require("rollup-plugin-uglify").uglify;

const {common} = require("../config/banner");
const version = require("../package.json").version;


const bannerCommon = `/*
${common}
*/`;

const uglify = pluginUglify({
	sourcemap: true,
	output: {
		comments: (node, comment) => {
			const text = comment.value;
			const type = comment.type;

			if (type === "comment2") {
				// multiline comment
				return /@egjs\/infinitegrid/.test(text);
			}
			return false;
		},
	},
});


const babel = pluginBabel({
	babelrc: false,
	"presets": [
		[
			"@babel/preset-env",
			{
				"loose": true,
				"modules": false,
			},
		],
	],
	"plugins": [
		"no-side-effect-class-properties",
		[
			"@babel/plugin-proposal-class-properties",
			{
				"loose": true,
			},
		],
		"@babel/plugin-transform-object-assign",
		"transform-es3-property-literals",
		"transform-es3-member-expression-literals",
	],
});
const replace = pluginReplace({
	"#__VERSION__#": version,
	delimiters: ["", ""],
});

function umd({
	input,
	output,
	library,
	ugly,
	externals = {},
}) {
	const plugins = [babel, replace];

	ugly && plugins.push(uglify);
	return {
		input,
		plugins,
		external: Object.keys(externals),
		output: {
			file: output,
			globals: externals,
			banner: bannerCommon,
			freeze: false,
			name: library,
			format: "umd",
			exports: "default",
			interop: false,
			sourcemap: true,
		},
	};
}

exports.umds = function umds({
	input,
	outputs,
	library,
	externals,
	ugly,
}) {
	return outputs.map(output => umd({
		input,
		output,
		library,
		externals,
		ugly: ugly || ~output.indexOf(".min"),
	}));
};

exports.esm = function esm({
	input,
	output,
}) {
	const plugins = [babel, replace];

	return {
		input,
		plugins,
		output: {
			file: output,
			banner: bannerCommon,
			freeze: false,
			format: "esm",
			interop: false,
			sourcemap: true,
		},
	};
};

exports.umd = umd;
