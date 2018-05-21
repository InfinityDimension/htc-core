

'use strict';

/**
 * Extends standard Error with a code field and toJson function.
 *
 * @class
 * @memberof helpers
 * @param {string} message
 * @param {number} code
 * @see Parent: {@link helpers}
 * @todo Add description for the params
 */
function ApiError(message, code) {
	this.message = message;
	this.code = code;
}

ApiError.prototype = new Error();

/**
 * Description of the function.
 *
 * @todo Add @returns tag
 */
ApiError.prototype.toJson = function() {
	return {
		message: this.message,
	};
};

module.exports = ApiError;
