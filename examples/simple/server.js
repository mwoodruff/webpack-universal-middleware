// Server only code.

const common = require('./common');

console.log("From the server: " + common);

module.exports = function (req, res, next) {

	if (req.url == "/test") {
		res.send("From the server: " + common);
	} else {
		next();
	}

}