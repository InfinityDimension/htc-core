

'use strict';

const connectionsTable = require('../../workers/connections_table');

/**
 * @param {object} request
 */
function addNonceToRequest(request) {
	request.data = request.data || {};
	request.data.nonce = connectionsTable.getNonce(request.socket.id);
}

const receiveDataEvents = ['postBlock', 'postTransactions', 'postSignatures'];

/**
 * Middleware used to process every emit event received by SlaveWAMPServer in workers_controller.js
 * @param {Object} req
 * @param {function} next
 */
function emitMiddleware(req, next) {
	if (receiveDataEvents.indexOf(req.event) !== -1) {
		addNonceToRequest(req);
	}
	return next();
}

module.exports = emitMiddleware;
