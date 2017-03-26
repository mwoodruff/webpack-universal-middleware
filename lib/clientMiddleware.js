const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const Router = require('express').Router;

const Reporter = require('./reporter');

module.exports = function (compiler, options = {}) {
	options.reporter = options.reporter || Reporter(options)
	options.reporter.observe(compiler);

	const app = Router();
  const dev = webpackDevMiddleware(compiler, Object.assign({}, {
    quiet: true,
    publicPath: compiler.options.output.publicPath || '/'
  }, options.webpackDevMiddleware));
  dev.waitUntilValid((...args) => {
    if (typeof options.waitUntilValid === 'function') {
      options.waitUntilValid(dev, ...args);
    }
  });
  app.use(dev);

  const hot = webpackHotMiddleware(compiler, Object.assign({}, {
    log: false
  }, options.webpackHotMiddlware));
  compiler.plugin('compilation', compilation => {
    if (typeof options.clientCompilation === 'function') {
      options.clientCompilation(hot, compilation);
    }
  });
	app.use(hot);
  return app;
};
