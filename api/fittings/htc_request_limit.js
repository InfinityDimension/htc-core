

'use strict';

var _ = require('lodash');
var RateLimit = require('express-rate-limit');
var debug = require('debug')('swagger:htc:request_limit');
var config = require('../../helpers/swagger_module_registry').getConfig();

var defaults = {
	max: 0, // Disabled
	delayMs: 0, // Disabled
	delayAfter: 0, // Disabled
	windowMs: 60000, // 1 minute window
};

/**
 * Description of the function.
 *
 * @func create_request_limit
 * @memberof api.fittings
 * @requires debug
 * @requires express-rate-limit
 * @requires helpers/swagger_module_registry.getConfig
 * @requires lodash
 * @param {Object} fittingDef
 * @param {Object} bagpipes
 * @returns {function} {@link api.fittings.htc_request_limit}
 * @todo Add description for the function and the params
 */
module.exports = function create(fittingDef) {
	debug('config: %j', fittingDef);
	var limits = {};
	var appConfigLimits = {};
	var overrideLimits = {};

	if (config) {
		appConfigLimits = config.api.options.limits;
	} else {
		appConfigLimits = {};
	}

	if (fittingDef && fittingDef.limits) {
		overrideLimits = fittingDef.limits;
	} else {
		overrideLimits = {};
	}

	_.assign(limits, defaults, appConfigLimits, overrideLimits);

	debug('limits: %j', limits);

	var middleware = new RateLimit(_.clone(limits));

	/**
	 * Description of the function.
	 *
	 * @func htc_request_limit
	 * @memberof api.fittings
	 * @param {Object} context
	 * @param {function} cb
	 * @returns {function} {@link api.fittings.htc_request_limit}
	 * @todo Add description for the function and the params
	 */
	function htc_request_limit(context, cb) {
		debug('exec');
		middleware(context.request, context.response, cb);
	}

	htc_request_limit.limits = limits;
	htc_request_limit.defaults = defaults;

	return htc_request_limit;
};
