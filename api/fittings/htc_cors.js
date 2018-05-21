

'use strict';

var debug = require('debug')('swagger:htc:cors');
var CORS = require('cors');
var modules = require('../../helpers/swagger_module_registry');

/**
 * Description of the function.
 *
 * @func create_cors
 * @memberof api.fittings
 * @requires cors
 * @requires debug
 * @requires lodash
 * @param {Object} fittingDef
 * @param {Object} bagpipes
 * @returns {function} {@link api.fittings.htc_cors}
 * @todo Add description for the function and the params
 */
module.exports = function create(fittingDef) {
	debug('config: %j', fittingDef);
	var config = modules.getConfig();

	var middleware = CORS({
		origin: config.api.options.cors.origin,
		methods: config.api.options.cors.methods,
	});

	/**
	 * Description of the function.
	 *
	 * @func htc_cors
	 * @memberof api.fittings
	 * @param {Object} context
	 * @param {function} cb
	 * @todo Add description for the function and the params
	 */
	return function htc_cors(context, cb) {
		debug('exec');
		middleware(context.request, context.response, cb);
	};
};
