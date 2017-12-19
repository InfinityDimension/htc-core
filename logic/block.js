'use strict';

const slots = require('../helpers/slots.js');
const crypto = require('crypto');
const bignum = require('../helpers/bignum.js');
const ByteBuffer = require('bytebuffer');
const BlockReward = require('../logic/blockReward.js');
const constants = require('../helpers/constants.js');
const transactionTypes = require('../helpers/transactionTypes.js');

// Private fields
let __private = {};

/**
 * Main Block logic.
 * @param {Object} ed
 * @param {ZSchema} schema
 * @param {Transaction} transaction
 * @param {function} cb - Callback function.
 * @return  With `this` as data.
 */
// Constructor
function Block(ed, schema, transaction, cb) {
    this.scope = {
        ed: ed,
        schema: schema,
        transaction: transaction,
    };
    if (cb) {
        return setImmediate(cb, null, this);
    }
}

// Private methods
/**
 * Creates a blockReward instance.
 * @private
 */
__private.blockReward = new BlockReward();

/**
 * Gets address by public
 * @param {publicKey} publicKey
 * @return {address} address
 */
__private.getAddressByPublicKey = function (publicKey) {
    let addressHelp=require('../helpers/address');
    return addressHelp.generateBase58Address(publicKey);
};

// Public methods
/**
 * Sorts input data transactions.
 * Calculates reward based on previous block data.
 * Generates new block.
 * @param {Object} data
 * @returns {block} block
 */
Block.prototype.create = function (data) {
    let transactions = data.transactions.sort(function compare(a, b) {
        // Place MULTI transaction after all other transaction types
        if (a.type === transactionTypes.MULTI && b.type !== transactionTypes.MULTI) {
            return 1;
        }
        // Place all other transaction types before MULTI transaction
        if (a.type !== transactionTypes.MULTI && b.type === transactionTypes.MULTI) {
            return -1;
        }
        // Place depending on type (lower first)
        if (a.type < b.type) {
            return -1;
        }
        if (a.type > b.type) {
            return 1;
        }
        // Place depending on amount (lower first)
        if (a.amount < b.amount) {
            return -1;
        }
        if (a.amount > b.amount) {
            return 1;
        }
        return 0;
    });

    let nextHeight = (data.previousBlock) ? data.previousBlock.height + 1 : 1;

    let reward = __private.blockReward.calcReward(nextHeight),
        totalFee = 0, totalAmount = 0, size = 0;

    let blockTransactions = [];
    let payloadHash = crypto.createHash('sha256');

    for (let i = 0; i < transactions.length; i++) {
        let transaction = transactions[i];
        let bytes = this.scope.transaction.getBytes(transaction);

        if (size + bytes.length > constants.maxPayloadLength) {
            break;
        }

        size += bytes.length;

        totalFee += transaction.fee;
        totalAmount += transaction.amount;

        blockTransactions.push(transaction);
        payloadHash.update(bytes);
    }

    let block = {
        version: 0,
        totalAmount: totalAmount,
        totalFee: totalFee,
        reward: reward,
        payloadHash: payloadHash.digest().toString('hex'),
        timestamp: data.timestamp,
        numberOfTransactions: blockTransactions.length,
        payloadLength: size,
        previousBlock: data.previousBlock.id,
        generatorPublicKey: data.keypair.publicKey.toString('hex'),
        transactions: blockTransactions
    };

    try {
        block.blockSignature = this.sign(block, data.keypair);

        block = this.objectNormalize(block);
    } catch (e) {
        throw e;
    }

    return block;
};

/**
 * Creates a block signature.
 * @param {block} block
 * @param {Object} keypair
 * @returns {signature} block signature
 */
Block.prototype.sign = function (block, keypair) {
    let hash = this.getHash(block);

    return this.scope.ed.sign(hash, keypair).toString('hex');
};

/**
 * @param {block} block
 * @return {!Array} Contents as an ArrayBuffer
 * @throws {error} If buffer fails
 */
Block.prototype.getBytes = function (block) {
    let size = 4 + 4 + 8 + 4 + 4 + 8 + 8 + 4 + 4 + 4 + 32 + 32 + 64;
    let b, i;

    try {
        let bb = new ByteBuffer(size, true);
        bb.writeInt(block.version);
        bb.writeInt(block.timestamp);

        if (block.previousBlock) {
            // let pb = new bignum(block.previousBlock).toBuffer({size: '8'});
            let pb = Buffer.from(block.previousBlock);

            for (i = 0; i < 8; i++) {
                bb.writeByte(pb[i]);
            }
        } else {
            for (i = 0; i < 8; i++) {
                bb.writeByte(0);
            }
        }

        bb.writeInt(block.numberOfTransactions);
        bb.writeLong(block.totalAmount);
        bb.writeLong(block.totalFee);
        bb.writeLong(block.reward);

        bb.writeInt(block.payloadLength);

        let payloadHashBuffer = Buffer.from(block.payloadHash, 'hex');
        for (i = 0; i < payloadHashBuffer.length; i++) {
            bb.writeByte(payloadHashBuffer[i]);
        }

        let generatorPublicKeyBuffer = Buffer.from(block.generatorPublicKey, 'hex');
        for (i = 0; i < generatorPublicKeyBuffer.length; i++) {
            bb.writeByte(generatorPublicKeyBuffer[i]);
        }

        if (block.blockSignature) {
            let blockSignatureBuffer = Buffer.from(block.blockSignature, 'hex');
            for (i = 0; i < blockSignatureBuffer.length; i++) {
                bb.writeByte(blockSignatureBuffer[i]);
            }
        }

        bb.flip();
        b = bb.toBuffer();
    } catch (e) {
        throw e;
    }

    return b;
};

/**
 * Verifies block hash, generator block publicKey and block signature.
 * @param {block} block
 * @return {boolean} verified hash, signature and publicKey
 * @throws {error} catch error
 */
Block.prototype.verifySignature = function (block) {
    let remove = 64;
    let res;

    try {
        let data = this.getBytes(block);
        let data2 = Buffer.alloc(data.length - remove);

        for (let i = 0; i < data2.length; i++) {
            data2[i] = data[i];
        }
        let hash = crypto.createHash('sha256').update(data2).digest();
        let blockSignatureBuffer = Buffer.from(block.blockSignature, 'hex');
        let generatorPublicKeyBuffer = Buffer.from(block.generatorPublicKey, 'hex');
        res = this.scope.ed.verify(hash, blockSignatureBuffer || ' ', generatorPublicKeyBuffer || ' ');
    } catch (e) {
        throw e;
    }

    return res;
};

Block.prototype.dbTable = 'blocks';

Block.prototype.dbFields = [
    'id',
    'version',
    'timestamp',
    'height',
    'previousBlock',
    'numberOfTransactions',
    'totalAmount',
    'totalFee',
    'reward',
    'payloadLength',
    'payloadHash',
    'generatorPublicKey',
    'blockSignature'
];

/**
 * Creates db object transaction to `blocks` table.
 * @param {block} block
 * @return {Object} created object {table, fields, values}
 * @throws {error} catch error
 */
Block.prototype.dbSave = function (block) {
    let payloadHash, generatorPublicKey, blockSignature;

    try {
        payloadHash = Buffer.from(block.payloadHash, 'hex');
        generatorPublicKey = Buffer.from(block.generatorPublicKey, 'hex');
        blockSignature = Buffer.from(block.blockSignature, 'hex');
    } catch (e) {
        throw e;
    }

    return {
        table: this.dbTable,
        fields: this.dbFields,
        values: {
            id: block.id,
            version: block.version,
            timestamp: block.timestamp,
            height: block.height,
            previousBlock: block.previousBlock || null,
            numberOfTransactions: block.numberOfTransactions,
            totalAmount: block.totalAmount,
            totalFee: block.totalFee,
            reward: block.reward || 0,
            payloadLength: block.payloadLength,
            payloadHash: payloadHash,
            generatorPublicKey: generatorPublicKey,
            blockSignature: blockSignature
        }
    };
};

Block.prototype.schema = {
    id: 'Block',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'id',
            minLength: 1,
            maxLength: 64
        },
        height: {
            type: 'integer'
        },
        blockSignature: {
            type: 'string',
            format: 'signature'
        },
        generatorPublicKey: {
            type: 'string',
            format: 'publicKey'
        },
        numberOfTransactions: {
            type: 'integer'
        },
        payloadHash: {
            type: 'string',
            format: 'hex'
        },
        payloadLength: {
            type: 'integer'
        },
        previousBlock: {
            type: 'string',
            format: 'id',
            minLength: 1,
            maxLength: 64
        },
        timestamp: {
            type: 'integer'
        },
        totalAmount: {
            type: 'integer',
            minimum: 0
        },
        totalFee: {
            type: 'integer',
            minimum: 0
        },
        reward: {
            type: 'integer',
            minimum: 0
        },
        transactions: {
            type: 'array',
            uniqueItems: true
        },
        version: {
            type: 'integer',
            minimum: 0
        }
    },
    required: ['blockSignature', 'generatorPublicKey', 'numberOfTransactions', 'payloadHash', 'payloadLength', 'timestamp', 'totalAmount', 'totalFee', 'reward', 'transactions', 'version']
};

/**
 * @param {block} block
 * @return {error|transaction} error string | block normalized
 * @throws {string|error} error message | catch error
 */
Block.prototype.objectNormalize = function (block) {
    let i;

    for (i in block) {
        if (block[i] === null || typeof block[i] === 'undefined') {
            delete block[i];
        }
    }

    let report = this.scope.schema.validate(block, Block.prototype.schema);

    if (!report) {
        throw 'Failed to validate block schema: ' + this.scope.schema.getLastErrors().map(function (err) {
            return err.message;
        }).join(', ');
    }

    try {
        for (i = 0; i < block.transactions.length; i++) {
            block.transactions[i] = this.scope.transaction.objectNormalize(block.transactions[i]);
        }
    } catch (e) {
        throw e;
    }

    return block;
};

/**
 * Calculates block id based on block.
 * @param {block} block
 * @return {string} id string
 */
Block.prototype.getId = function (block) {
    let hash = crypto.createHash('sha256').update(this.getBytes(block)).digest();
    // let temp = Buffer.alloc(8);
    // for (let i = 0; i < 8; i++) {
    //     temp[i] = hash[7 - i];
    // }
    //
    // let id = new bignum.fromBuffer(temp).toString();
    return hash.toString('hex');
};

/**
 * Creates hash based on block bytes.
 * @param {block} block
 * @return {hash} sha256 crypto hash
 */
Block.prototype.getHash = function (block) {
    return crypto.createHash('sha256').update(this.getBytes(block)).digest();
};

/**
 * Returns send fees from constants.
 * @param {block} block
 * @return {number} fee
 * @todo delete unused input parameter
 */
Block.prototype.calculateFee = function (block) {
    return constants.fees.send;
};

/**
 * Creates block object based on raw data.
 * @param {Object} raw
 * @return {null|block} blcok object
 */
Block.prototype.dbRead = function (raw) {
    if (!raw.b_id) {
        return null;
    } else {
        let block = {
            id: raw.b_id,
            version: parseInt(raw.b_version),
            timestamp: parseInt(raw.b_timestamp),
            height: parseInt(raw.b_height),
            previousBlock: raw.b_previousBlock,
            numberOfTransactions: parseInt(raw.b_numberOfTransactions),
            totalAmount: parseInt(raw.b_totalAmount),
            totalFee: parseInt(raw.b_totalFee),
            reward: parseInt(raw.b_reward),
            payloadLength: parseInt(raw.b_payloadLength),
            payloadHash: raw.b_payloadHash,
            generatorPublicKey: raw.b_generatorPublicKey,
            generatorId: __private.getAddressByPublicKey(raw.b_generatorPublicKey),
            blockSignature: raw.b_blockSignature,
            confirmations: parseInt(raw.b_confirmations)
        };
        block.totalForged = new bignum(block.totalFee).plus(new bignum(block.reward)).toString();
        return block;
    }
};

// Export
module.exports = Block;
