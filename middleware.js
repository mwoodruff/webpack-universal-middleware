const Express = require('express');
const Router = Express.Router;
const Reporter = require('./lib/reporter');
const serverMiddleware = require('./lib/serverMiddleware');
const clientMiddleware = require('./lib/clientMiddleware');
const path = require('path');

module.exports = function (multiCompiler, options = {}) {

	if (!options.reporter) {
		options.reporter = Reporter(options);
	}

	if (!options.static) {
		options.static = [
			"./static"
		]
	} else if (typeof (options.static) !== "array") {
		options.static = [options.static];
	}

	const app = Router();

	options.static.forEach(p => {
		var dir = path.resolve(p);

		if (p) {
			app.use(Express.static("static"))
		}
	})

	for (let compiler of multiCompiler.compilers) {

		if (!compiler.options.name) {
			throw new Error("Configuration name is not optional. Make sure each webapck configuration has a name: 'value' specified.")
		}

		switch (compiler.options.target) {
			case "web":
				app.use(clientMiddleware(compiler, options));
				break;
			case "node":
				app.use(serverMiddleware(compiler, options));
				break;
			default:
				throw new Error(`Unsupported compiler target "${compiler.options.target}" in config.`);
		}
	}

	return app;
}