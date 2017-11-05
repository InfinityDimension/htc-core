'use strict';

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const bs58 = require('base-x')(BASE58);
const crypto=require('crypto');
const suffix = 'L';

module.exports={
    generateBase58Address:function (publicKey) {
        if (typeof publicKey === 'string') {
            publicKey = Buffer.from(publicKey, 'hex');
        }
        let sha256 = crypto.createHash('sha256').update(publicKey).digest();
        sha256 = crypto.createHash('ripemd160').update(sha256).digest();
        return bs58.encode(sha256)+suffix;
    }
};
