const constants = require('../helpers/constants.js');
module.exports = {
    account_model: {
        model: function (table) {
            return [
                {
                    name: 'username',
                    type: 'String',
                    filter: {
                        type: 'string',
                        case: 'lower',
                        maxLength: 20,
                        minLength: 1
                    },
                    conv: String,
                    immutable: true
                },
                {
                    name: 'isDelegate',
                    type: 'SmallInt',
                    filter: {
                        type: 'boolean'
                    },
                    conv: Boolean
                },
                {
                    name: 'u_isDelegate',
                    type: 'SmallInt',
                    filter: {
                        type: 'boolean'
                    },
                    conv: Boolean
                },
                {
                    name: 'secondSignature',
                    type: 'SmallInt',
                    filter: {
                        type: 'boolean'
                    },
                    conv: Boolean
                },
                {
                    name: 'u_secondSignature',
                    type: 'SmallInt',
                    filter: {
                        type: 'boolean'
                    },
                    conv: Boolean
                },
                {
                    name: 'u_username',
                    type: 'String',
                    filter: {
                        type: 'string',
                        case: 'lower',
                        maxLength: 20,
                        minLength: 1
                    },
                    conv: String,
                    immutable: true
                },
                {
                    name: 'address',
                    type: 'String',
                    filter: {
                        required: true,
                        type: 'string',
                        minLength: 1,
                        maxLength: 50
                    },
                    conv: String,
                    immutable: true
                },
                {
                    name: 'publicKey',
                    type: 'Binary',
                    filter: {
                        type: 'string',
                        format: 'publicKey'
                    },
                    conv: String,
                    immutable: true,
                    expression: 'ENCODE("publicKey", \'hex\')'
                },
                {
                    name: 'secondPublicKey',
                    type: 'Binary',
                    filter: {
                        type: 'string',
                        format: 'publicKey'
                    },
                    conv: String,
                    immutable: true,
                    expression: 'ENCODE("secondPublicKey", \'hex\')'
                },
                {
                    name: 'balance',
                    type: 'BigInt',
                    filter: {
                        required: true,
                        type: 'integer',
                        minimum: 0,
                        maximum: constants.totalAmount
                    },
                    conv: Number,
                    expression: '("balance")::bigint'
                },
                {
                    name: 'u_balance',
                    type: 'BigInt',
                    filter: {
                        required: true,
                        type: 'integer',
                        minimum: 0,
                        maximum: constants.totalAmount
                    },
                    conv: Number,
                    expression: '("u_balance")::bigint'
                },
                {
                    name: 'vote',
                    type: 'BigInt',
                    filter: {
                        type: 'integer'
                    },
                    conv: Number,
                    expression: '("vote")::bigint'
                },
                {
                    name: 'rate',
                    type: 'BigInt',
                    filter: {
                        type: 'integer'
                    },
                    conv: Number,
                    expression: '("rate")::bigint'
                },
                {
                    name: 'delegates',
                    type: 'Text',
                    filter: {
                        type: 'array',
                        uniqueItems: true
                    },
                    conv: Array,
                    expression: '(SELECT ARRAY_AGG("dependentId") FROM ' + table + '2delegates WHERE "accountId" = a."address")'
                },
                {
                    name: 'u_delegates',
                    type: 'Text',
                    filter: {
                        type: 'array',
                        uniqueItems: true
                    },
                    conv: Array,
                    expression: '(SELECT ARRAY_AGG("dependentId") FROM ' + table + '2u_delegates WHERE "accountId" = a."address")'
                },
                {
                    name: 'multisignatures',
                    type: 'Text',
                    filter: {
                        type: 'array',
                        uniqueItems: true
                    },
                    conv: Array,
                    expression: '(SELECT ARRAY_AGG("dependentId") FROM ' + table + '2multisignatures WHERE "accountId" = a."address")'
                },
                {
                    name: 'u_multisignatures',
                    type: 'Text',
                    filter: {
                        type: 'array',
                        uniqueItems: true
                    },
                    conv: Array,
                    expression: '(SELECT ARRAY_AGG("dependentId") FROM ' + table + '2u_multisignatures WHERE "accountId" = a."address")'
                },
                {
                    name: 'multimin',
                    type: 'SmallInt',
                    filter: {
                        type: 'integer',
                        minimum: 0,
                        maximum: 17
                    },
                    conv: Number
                },
                {
                    name: 'u_multimin',
                    type: 'SmallInt',
                    filter: {
                        type: 'integer',
                        minimum: 0,
                        maximum: 17
                    },
                    conv: Number
                },
                {
                    name: 'multilifetime',
                    type: 'SmallInt',
                    filter: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 72
                    },
                    conv: Number
                },
                {
                    name: 'u_multilifetime',
                    type: 'SmallInt',
                    filter: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 72
                    },
                    conv: Number
                },
                {
                    name: 'blockId',
                    type: 'String',
                    filter: {
                        type: 'string',
                        minLength: 1,
                        maxLength: 64
                    },
                    conv: String
                },
                {
                    name: 'nameexist',
                    type: 'SmallInt',
                    filter: {
                        type: 'boolean'
                    },
                    conv: Boolean
                },
                {
                    name: 'u_nameexist',
                    type: 'SmallInt',
                    filter: {
                        type: 'boolean'
                    },
                    conv: Boolean
                },
                {
                    name: 'producedblocks',
                    type: 'Number',
                    filter: {
                        type: 'integer',
                        minimum: -1,
                        maximum: 1
                    },
                    conv: Number
                },
                {
                    name: 'missedblocks',
                    type: 'Number',
                    filter: {
                        type: 'integer',
                        minimum: -1,
                        maximum: 1
                    },
                    conv: Number
                },
                {
                    name: 'fees',
                    type: 'BigInt',
                    filter: {
                        type: 'integer'
                    },
                    conv: Number,
                    expression: '("fees")::bigint'
                },
                {
                    name: 'rewards',
                    type: 'BigInt',
                    filter: {
                        type: 'integer'
                    },
                    conv: Number,
                    expression: '("rewards")::bigint'
                },
                {
                    name: 'virgin',
                    type: 'SmallInt',
                    filter: {
                        type: 'boolean'
                    },
                    conv: Boolean,
                    immutable: true
                }
            ]
        }
    }
};