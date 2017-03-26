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