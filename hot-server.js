
var context = global.webpackUniversalServerMiddlewareContext;

if (!module.hot) {
	throw new Error("[WUS] Hot Module Replacement is disabled, or webpack-universal-server is in webpack externals.");
}

context.hotCheck = function () {

	context.log("Applying updates...");

	function checkAndApply(resolve, reject) {
		return module.hot.check(false)
			.then(updated => {
				if (updated && module.hot.status() == 'ready') {
					return module.hot.apply({ ignoreErrored: true })
						.then(() => checkAndApply(resolve, reject))
						.catch(reject)
				}

				resolve();
			})
	}

	return new Promise(checkAndApply)
		.then(() => {
			context.log("Updates applied. ");
		})
		.catch(() => {
			context.log("Updates not accepted, reloading...")
			return Promise.reject();
		});

};