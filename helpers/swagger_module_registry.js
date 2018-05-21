

'use strict';

// Private fields
var __private = {};

/**
 * Description of the module.
 *
 * @module
 * @see Parent: {@link helpers}
 * @todo Add description for the module
 */

/**
 * A module to reference the scope of the application between swagger pipeline.
 *
 * @param {Object} scope - Application scope
 */
function bind(scope) {
	__private = {
		config: scope.config,
		cache: scope.modules.cache,
		logger: scope.logger,
	};
}

/**
 * Get cache module.
 *
 * @returns {Object}
 * @todo Add description for the return value
 */
function getCache() {
	return __private.cache;
}

/**
 * Get system logger.
 *
 * @returns {Object}
 * @todo Add description for the return value
 */
function getLogger() {
	return __private.logger;
}

/**
 * Get system config.
 *
 * @returns {Object}
 * @todo Add description for the return value
 */
function getConfig() {
	return __private.config;
}

module.exports = {
	bind,
	getCache,
	getLogger,
	getConfig,
};
