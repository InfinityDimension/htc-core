

'use strict';

/**
 * Description of the namespace.
 *
 * @namespace api_codes
 * @memberof helpers
 * @see Parent: {@link helpers}
 * @property {number} OK
 * @property {number} EMPTY_RESOURCES_OK
 * @property {number} NO_CONTENT
 * @property {number} INTERNAL_SERVER_ERROR
 * @property {number} BAD_REQUEST
 * @property {number} FORBIDDEN
 * @property {number} NOT_FOUND
 * @property {number} PROCESSING_ERROR
 * @property {number} TOO_MANY_REQUESTS
 * @todo Add description for the namespace and the properties
 */
module.exports = {
	OK: 200,
	EMPTY_RESOURCES_OK: 200,
	NO_CONTENT: 204,
	INTERNAL_SERVER_ERROR: 500,
	BAD_REQUEST: 400,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	PROCESSING_ERROR: 409,
	TOO_MANY_REQUESTS: 429,
};
