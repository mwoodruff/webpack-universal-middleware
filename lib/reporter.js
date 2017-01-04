const webpack = require('webpack');
const chalk = require('chalk');
const notifier = require('node-notifier');

module.exports = function Reporter(options) {

	options.notify = options.notify === undefined ? true : false;
	options.dedupErrors = options.dedupErrors === undefined ? true : false;

	let buildPercent = 100;
	const states = new Map();
	const errors = [];
	const warnings = [];

	function leftpad(msg, len) {
		return (" ".repeat(len) + msg).slice(-1 * len);
	}

	function calcBuildPercent() {
		let complete = 0;
		let total = 0;

		states.forEach(state => {
			if (state.progress != 1) {
				complete += state.progress;
				total += 1;
			}
		});

		return total == 0 ? 100 : Math.floor(complete / total * 100);
	}

	function writeMessage({
		left = "",
		msg = "", msgColor = "white",
		tokenColor = "cyan",
		bgColor = "bgBlack"}) {

		const percentText = `[${leftpad(buildPercent, 3)}%] `;
		const pad = " ".repeat(process.stdout.columns - left.length - msg.length - percentText.length - 3);
		const lineEnding = left == "" ? "\r" : "\n";

		process.stdout.write("\r" + chalk[bgColor](chalk[tokenColor](left) + " " + chalk[msgColor](msg) + pad + chalk[tokenColor](percentText)) + lineEnding);
	}

	function observe(compiler) {
		const state = {
			progress: 1,
			stats: null
		};

		states.set(compiler, state);

		function log(msg, msgColor = "white") {
			writeMessage({ left: "[WUM]", msg: `${compiler.options.name} ${msg}`, msgColor });
		}

		function done(stats) {
			state.stats = stats;
			state.progress = 1;

			buildPercent = calcBuildPercent();

			const jsonStats = state.stats.toJson();

			if (stats.hasErrors()) {
				log('Done with ERRORS.', "red")
			} else if (stats.hasWarnings()) {
				log('Done with WARNINGS.', "yellow")
			} else {
				log('Done.', 'green');
			}

			state.stats.compilation.errors.forEach((e, i) => {
				const message = e.message;
				const source = e.module.resource;

				const errorToken = source + message;

				if (!options.dedupErrors || !errors.find(e => e == errorToken)) {
					errors.push(errorToken);
					writeMessage({ left: "ERROR", tokenColor: "white", bgColor: "bgRed" });
					console.log(chalk.red("ERROR in " + jsonStats.errors[i]));
				}

			});

			state.stats.compilation.warnings.forEach((w, i) => {
				warnings.push(w);
				writeMessage({ left: "WARNING", tokenColor: "black", bgColor: "bgYellow" });
				console.log(chalk.yellow("WARNING in " + jsonStats.warnings[i]));
			});

			if (buildPercent == 100) {
				setTimeout(() => {
					let notifyTitle, notifyMessage;

					if (errors.length) {
						notifyTitle = 'Build ERRORS';
						notifyMessage = 'Build completed with errors!';
						writeMessage({ left: "<<< BUILD END", tokenColor: "white", bgColor: "bgRed" });
					} else if (warnings.length) {
						notifyTitle = 'Build WARNINGS';
						notifyMessage = 'Build completed with warnings!';
						writeMessage({ left: "<<< BUILD END", tokenColor: "black", bgColor: "bgYellow" });
					} else {
						notifyTitle = 'Build successful';
						notifyMessage = 'Build completed successfully.';
						writeMessage({ left: "<<< BUILD END", tokenColor: "white", bgColor: "bgGreen" });
					}

					if (options.notify) {
						notifier.notify({
							title: notifyTitle,
							message: notifyMessage,
							wait: false
						});
					}
				}, 100);
			}
		}

		function progress(pct) {

			state.progress = pct;

			const lastBuildPercent = buildPercent;
			buildPercent = calcBuildPercent();

			if (lastBuildPercent == buildPercent) {
				return;
			}

			if (pct == 0) {
				if (lastBuildPercent == 100) {
					errors.length = 0;
					warnings.length = 0;
					writeMessage({ left: ">>> BUILD START", tokenColor: "white", bgColor: "bgBlue" });
				}
			}
		}

		compiler.plugin("done", done);
		new webpack.ProgressPlugin(progress).apply(compiler);

		return log;
	}

	return {
		observe
	};
}