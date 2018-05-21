

'use strict';

var Promise = require('bluebird');

/**
 * Description of the class.
 *
 * @class
 * @memberof helpers
 * @returns {Object}
 * @see Parent: {@link helpers}
 * @todo Add description for the class and the return value
 */
function PromiseDefer() {
	var resolve;
	var reject;
	var promise = new Promise((__resolve, __reject) => {
		resolve = __resolve;
		reject = __reject;
	});

	return {
		resolve,
		reject,
		promise,
	};
}

module.exports = PromiseDefer;
