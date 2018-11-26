module.exports = config => {
	const karmaConfig = {
		frameworks: ["mocha", "chai", "sinon"],

		// list of files / patterns to load in the browser
		files: [
			"./node_modules/lite-fixture/index.js",
			"./test/unit/**/*.spec.js",
		],

		client: {
			mocha: {
				opts: "./mocha.opts",
			},
		},

		webpack: {
			devtool: "inline-source-map",
			module: {
				rules: [
					{
						test: /\.js$/,
						exclude: /node_modules/,
						loader: "babel-loader",
						query: {
							"presets": [
								[
									"@babel/preset-env",
									{
										"loose": true,
										"modules": "commonjs",
									},
								],
							],
							"plugins": [
								"add-module-exports",
								"transform-es3-property-literals",
								"transform-es3-member-expression-literals",
							],
						},
					},
				],
			},
		},
		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			"./test/**/*.spec.js": config.coverage ? ["webpack"] : ["webpack", "sourcemap"],
		},

		browsers: [],
		customLaunchers: {
			CustomChromeHeadless: {
				base: "ChromeHeadless",
				flags: ["--disable-gpu", "--no-sandbox"],
			},
		},
		reporters: ["mocha"],
		webpackMiddleware: {
			noInfo: true,
		},
	};

	karmaConfig.browsers.push(config.chrome ? "Chrome" : "CustomChromeHeadless");

	if (config.coverage) {
		karmaConfig.reporters.push("coverage-istanbul");
		karmaConfig.coverageIstanbulReporter = {
			reports: ["text-summary", "html", "lcovonly"],
			dir: "./coverage",
		};
		karmaConfig.webpack.module.rules.unshift({
			test: /\.js$/,
			exclude: /(node_modules|test)/,
			loader: "istanbul-instrumenter-loader",
		});
		karmaConfig.singleRun = true;
	}

	config.set(karmaConfig);
};
