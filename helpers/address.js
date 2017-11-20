'use strict';

const bs58 = require('bs58');
const crypto = require('crypto');

module.exports = {
    generateBase58Address: function (publicKey) {
        if (typeof publicKey === 'string') {
            publicKey = Buffer.from(publicKey, 'hex');
        }
        let sha256 = crypto.createHash('sha256').update(publicKey).digest();
        sha256 = crypto.createHash('ripemd160').update(sha256).digest();
        return bs58.encode(sha256);
    }
};
