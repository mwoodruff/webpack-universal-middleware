const path = require('path');
const MemoryFS = require("memory-fs");
const chalk = require('chalk');
const Reporter = require('./reporter');
const requireString = require('./requireString');

module.exports = function (compiler, options = {}) {

	options.reporter = options.reporter || Reporter(options)

	const log = options.reporter.observe(compiler);

	let sharedContext = {
		log
	};

	const requestQueue = [];
	let server;

	const fs = compiler.outputFileSystem = new MemoryFS();

	function loadServer(stats) {
		let chunkName = Object.keys(stats.toJson().assetsByChunkName)[0];
		let assets = stats.toJson().assetsByChunkName[chunkName];
		let filename = Array.isArray(assets) ? assets.find(asset => /\.js$/.test(asset)) : assets;

		try {
			global.webpackUniversalServerMiddlewareContext = sharedContext;
			server = requireString(fs, path.join(compiler.outputPath, filename));
			global.webpackUniversalServerMiddlewareContext = null;

			log("Loaded.");
		} catch (e) {
			log("Load failed.", "red");
			process.stderr.write(chalk.red(e.message + "\n" + e.stack + "\n"));
		}
	}

	compiler.watch({}, function (err, stats) {

		if (stats.hasErrors()) {
			return;
		}

		if (!server || !sharedContext.hotCheck) {
			loadServer(stats);
			while (requestQueue.length) server.apply(void 0, requestQueue.shift());
		} else {
			sharedContext.hotCheck(stats).catch(() => loadServer(stats));
		}
	});

	return (req, res, next) => {
		if (server) {
			server(req, res, next);
			return;
		}

		requestQueue.push([req, res, next]);
	};
}