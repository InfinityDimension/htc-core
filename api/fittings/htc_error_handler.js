

'use strict';

var util = require('util');
var debug = require('debug')('swagger:htc:error_handler');

/**
 * Description of the function.
 *
 * @func create_error_handler
 * @memberof api.fittings
 * @requires debug
 * @requires util
 * @param {Object} fittingDef
 * @param {Object} bagpipes
 * @returns {function} {@link api.fittings.htc_error_handler}
 * @todo Add description for the function and the params
 */
module.exports = function create(fittingDef) {
	debug('config: %j', fittingDef);

	/**
	 * Description of the function.
	 *
	 * @func htc_error_handler
	 * @memberof api.fittings
	 * @param {Object} context
	 * @param {function} cb
	 * @todo Add description for the function and the params
	 */
	return function htc_error_handler(context, next) {
		if (!util.isError(context.error)) {
			return next();
		}

		var err = context.error;

		if (!context.statusCode || context.statusCode < 400) {
			if (
				context.response &&
				context.response.statusCode &&
				context.response.statusCode >= 400
			) {
				context.statusCode = context.response.statusCode;
			} else if (err.statusCode && err.statusCode >= 400) {
				context.statusCode = err.statusCode;
				delete err.statusCode;
			} else {
				context.statusCode = 500;
			}
		}

		debug('exec: %s', context.error.message);
		debug('status: %s', context.statusCode);
		debug('stack: %s', context.error.stack);

		if (context.statusCode === 500) {
			if (!fittingDef.handle500Errors) {
				return next(err);
			}

			err = {
				message: 'An unexpected error occurred while handling this request',
			};
		}

		context.headers['Content-Type'] = 'application/json';
		Object.defineProperty(err, 'message', { enumerable: true }); // Include message property in response
		delete context.error;
		next(null, JSON.stringify(err));
	};
};
