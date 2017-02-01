# Summary

This package provides `express` middleware for universal application development with `webpack`.

It makes it simple to run a development server that hot loads both client and server code, and provides a custom error reporter that tries to dedup errors that happen in shared code. It supports all the options of `webpack-dev-middleware` and `webpack-hot-middleware` for the client code, and provides automatic server-side reloading by either re-running the server code or webpack's hot module reloading, if enabled.

**It does this with one webpack config, without restarting the express server, and without any additional processes.**

Check out the `examples` folder in the git repo for more details.

# Getting Started

Install along with webpack and express:

```
> npm install --save-dev webpack-universal-server webpack express
```

Add your `webpack.config.js` file:

```javascript
const path = require('path');

const PATHS = {
	src: __dirname,
	out: path.join(__dirname, 'build')
}

module.exports = [
	{
		name: 'client',
		context: PATHS.src,
		entry: './client.js',
		output: {
			path: PATHS.out,
			filename: 'client.js',
			publicPath: '/'
		},
	},
	{
		name: 'server',
		context: PATHS.src,
		target: 'node',
		entry: './server.js',
		output: {
			path: PATHS.out,
			filename: 'server.js',
			libraryTarget: "commonjs2"
		}
	}
];
```

Add the middleware to your server:

```javascript
const express = require('express');
const webpack = require('webpack');
const webpackUniversalMiddleware = require('webpack-universal-middleware');

const configs = require('./webpack.config');
const multiCompiler = webpack(configs);

const app = express();

app.use(webpackUniversalMiddleware(multiCompiler));

app.listen(3000);
```

# Can I contribute?

Yes, please. Send me feedback, a bug report, or a pull request.
