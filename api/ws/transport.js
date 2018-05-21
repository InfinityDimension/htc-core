

'use strict';

var wsRPC = require('./rpc/ws_rpc').wsRPC;
var slaveRPCStub = require('./rpc/ws_rpc').slaveRPCStub;

/**
 * Description of the function.
 *
 * @class
 * @memberof api.ws
 * @see Parent: {@link api.ws}
 * @param {Object} transportModule
 * @todo Add description for the function and the params
 */
function TransportWSApi(transportModule) {
	wsRPC.getServer().registerRPCEndpoints({
		updatePeer: transportModule.internal.updatePeer,
		blocksCommon: transportModule.shared.blocksCommon,
		blocks: transportModule.shared.blocks,
		list: transportModule.shared.list,
		height: transportModule.shared.height,
		getTransactions: transportModule.shared.getTransactions,
		getSignatures: transportModule.shared.getSignatures,
		status: transportModule.shared.status,
	});

	wsRPC.getServer().registerEventEndpoints({
		postBlock: transportModule.shared.postBlock,
		postSignatures: transportModule.shared.postSignatures,
		postTransactions: transportModule.shared.postTransactions,
	});

	wsRPC.getServer().registerRPCEndpoints(slaveRPCStub);
}

module.exports = TransportWSApi;
