'use strict';

module.exports = {
    activeDelegates: 101,
    maxVotesPerTransaction: 33,
    addressLength: 208,
    blockHeaderLength: 248,
    blockReceiptTimeOut: 20, // 2 blocks
    confirmationLength: 77,
    epochTime: new Date(Date.UTC(2017, 10, 14, 11, 0, 0, 0)),
    fees: {
        send: 0,
        vote: 0,
        secondsignature: 0,
        delegate: 0,
        multisignature: 0,
        dapp: 0
    },
    feeStart: 1,
    feeStartVolume: 10000 * 100000000,
    fixedPoint: Math.pow(10, 8),
    maxAddressesLength: 208 * 128,
    maxAmount: 100000000,
    maxConfirmations: 77 * 100,
    maxPayloadLength: 1024 * 1024,
    maxPeers: 100,
    maxRequests: 10000 * 12,
    maxSharedTxs: 100,
    maxSignaturesLength: 196 * 256,
    maxTxsPerBlock: 500,
    minBroadhashConsensus: 51,
    nethashes: [
        // Mainnet
        'ed14889723f24ecc54871d058d98ce91ff2f973192075c0155ba2b7b70ad2511',
        // Testnet
        'da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba'
    ],
    numberLength: 100000000,
    requestLength: 104,
    // WARNING: When changing rewards you also need to change getBlockRewards(int) SQL function!
    rewards: {
        milestones: [
            0, // Initial Reward
            0, // Milestone 1
            0, // Milestone 2
            0, // Milestone 3
            0  // Milestone 4
        ],
        offset: 1451520,   // Start rewards at block (n)
        distance: 3000000, // Distance between each milestone
    },
    signatureLength: 196,
    // WARNING: When changing totalAmount you also need to change getBlockRewards(int) SQL function!
    totalAmount: 10000000000000000,
    unconfirmedTransactionTimeOut: 10800, // 1080 blocks
    multisigConstraints: {
        min: {
            minimum: 1,
            maximum: 15
        },
        lifetime: {
            minimum: 1,
            maximum: 72
        },
        keysgroup: {
            minItems: 1,
            maxItems: 15
        }
    }
};
