

'use strict';

var debug = require('debug')('swagger:htc:compression');
var _ = require('lodash');
var compression = require('compression');

/**
 * Description of the function.
 *
 * @func create_compression
 * @memberof api.fittings
 * @requires compression
 * @requires debug
 * @requires lodash
 * @param {Object} fittingDef
 * @param {Object} bagpipes
 * @returns {function} {@link api.fittings.htc_compression}
 * @todo Add description for the function and the params
 */
module.exports = function create(fittingDef) {
	debug('config: %j', fittingDef);

	var validCorsOptions = ['level', 'chunkSize', 'memLevel'];
	var middleware = compression(_.pick(fittingDef, validCorsOptions));

	/**
	 * Description of the function.
	 *
	 * @func htc_compression
	 * @memberof api.fittings
	 * @param {Object} context
	 * @param {function} cb
	 * @todo Add description for the function and the params
	 */
	return function htc_compression(context, cb) {
		debug('exec');
		middleware(context.request, context.response, cb);
	};
};
