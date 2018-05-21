'use strict';

const disconnect = peer => {
	if (peer.socket) {
		peer.socket.destroy(
			1000,
			'Intentionally disconnected from peer because of disconnect call'
		);
	}
	return peer;
};

module.exports = disconnect;
