const Module = require('module');
const path = require('path');

module.exports = function requireString(fs, filename) {
	const code = fs.readFileSync(filename).toString();

	if (filename.endsWith('json')) {
		return JSON.parse(code);
	}

	const filepath = path.dirname(filename);

	const m = new Module(filename, module.parent);
	m.filename = filename;
	m.paths = Module._nodeModulePaths(filepath);

	m.require = function (file) {
		if (/hot-update/.test(file)) {
			return requireString(fs, path.join(filepath, file));
		}
		return Module._load(file, this)
	};

	m._compile(code, filename)

	return m.exports.default ? m.exports.default : m.exports;
}