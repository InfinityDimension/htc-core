

'use strict';

var debug = require('debug')('swagger:htc:response_formatter');
var _ = require('lodash');

/**
 * Description of the function.
 *
 * @func create_response_formatter
 * @memberof api.fittings
 * @requires debug
 * @requires lodash
 * @param {Object} fittingDef
 * @param {Object} bagpipes
 * @returns {function} {@link api.fittings.htc_response_formatter}
 * @todo Add description for the function and the params
 */
module.exports = function create() {
	/**
	 * Description of the function.
	 *
	 * @func htc_response_formatter
	 * @memberof api.fittings
	 * @param {Object} context
	 * @param {function} next
	 * @todo Add description for the function and the params
	 */
	return function htc_response_formatter(context, next) {
		debug('exec');
		debug('received data:', context.input);

		if (_.isEmpty(context.input)) {
			context.headers = { 'content-type': 'application/json' };
			next(null, {});
			return;
		}

		var output = {};

		if (_.isArray(context.input)) {
			output = {
				meta: {},
				data: context.input,
				links: {},
			};
		} else if (_.isObject(context.input)) {
			if (Object.keys(context.input).sort() === ['data', 'links', 'meta']) {
				output = context.input;
			} else {
				output = {
					meta: context.input.meta || {},
					data: context.input.data || context.input,
					links: context.input.links || {},
				};
			}
		}

		debug("setting headers: 'content-type': 'application/json'");

		context.headers = { 'content-type': 'application/json' };
		next(null, output);
	};
};
