const Express = require('express');
const Router = Express.Router;
const Reporter = require('./lib/reporter');
const serverMiddleware = require('./lib/serverMiddleware');
const clientMiddleware = require('./lib/clientMiddleware');
const path = require('path');

module.exports = function (multiCompiler, options = {}) {
	if (!Array.isArray(multiCompiler.compilers)) {
    multiCompiler = { compilers: [multiCompiler] };
  }
  if (!options.reporter) {
    options.reporter = Reporter(options);
  }
  if (!options.static) {
    options.static = ['./static'];
  } else if (!Array.isArray(options.static)) {
    options.static = [options.static];
  }
  if (options.proxyTable !== Object(options.proxyTable)) {
    options.proxyTable = {};
  }

	const app = Router();
	options.static = options.static.filter(item => {
    let realPath;
    let virtualPath;
    if (item === Object(item) && is.string(item.virtualPath) && is.string(item.realPath)) {
      realPath = path.resolve(item.realPath);
      virtualPath = item.virtualPath;
      app.use(virtualPath, express.static(realPath));
    } else if (is.string(item)) {
      realPath = path.resolve(item);
      app.use(express.static(realPath));
    }
    return (virtualPath || realPath) && { virtualPath, realPath };
  });

  Object.keys(options.proxyTable).forEach(context => {
    const target = options.proxyTable[context];
    if (is.string(target)) {
      target = { target };
    }
    if (target.virtualPath) {
      const virtualPath = target.virtualPath;
      delete target.virtualPath;
      app.use(virtualPath, httpProxy(target.filter || context, target));
    } else {
      app.use(httpProxy(target.filter || context, target));
    }
  });

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
};
