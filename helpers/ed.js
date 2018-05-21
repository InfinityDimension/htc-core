// 'use strict';
//
// var sodium = require('sodium').api;
//
// /**
//  * Crypto functions that implements sodium.
//  *
//  */
// var ed = {};
//
// ed.makeKeypair = function(hash) {
// 	var keypair = sodium.crypto_sign_seed_keypair(hash);
//
// 	return {
// 		publicKey: keypair.publicKey,
// 		privateKey: keypair.secretKey,
// 	};
// };
//
// ed.sign = function(hash, privateKey) {
// 	return sodium.crypto_sign_detached(hash, privateKey);
// };
//
// ed.verify = function(hash, signature, publicKey) {
// 	return sodium.crypto_sign_verify_detached(signature, hash, publicKey);
// };
//
// module.exports = ed;

'use strict';

const ed = require('ed25519');
module.exports = {
    makeKeypair: ed.MakeKeypair,

    sign: ed.Sign,

    verify: ed.Verify
};
