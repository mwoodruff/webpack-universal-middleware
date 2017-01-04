const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const Router = require('express').Router;

const Reporter = require('./reporter');

module.exports = function (compiler, options = {}) {

	options.reporter = options.reporter || Reporter(options)

	options.reporter.observe(compiler);

	const app = Router();

	app.use(webpackDevMiddleware(compiler, Object.assign({}, {
		quiet: true,
		publicPath: compiler.options.output.publicPath || '/'
	}, options.webpackDevMiddleware)));

	app.use(webpackHotMiddleware(compiler, Object.assign({}, { log: false }, options.webpackHotMiddlware)));

	return app;

}