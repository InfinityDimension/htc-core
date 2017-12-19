'use strict';

var Router = require('../helpers/router');
var httpApi = require('../helpers/httpApi');

// Constructor
function TransactionsHttpApi(transactionsModule, app, logger, cache) {

    var router = new Router();

    // attach a middlware to endpoints
    router.attachMiddlwareForUrls(httpApi.middleware.useCache.bind(null, logger, cache), [
        'get /'
    ]);

    router.map(transactionsModule.shared, {
        'get /': 'getTransactions',
        'get /get': 'getTransaction',
        'get /count': 'getTransactionsCount',
        'get /queued/get': 'getQueuedTransaction',
        'get /queued': 'getQueuedTransactions',
        'get /multisignatures/get': 'getMultisignatureTransaction',
        'get /multisignatures': 'getMultisignatureTransactions',
        'get /unconfirmed/get': 'getUnconfirmedTransaction',
        'get /unconfirmed': 'getUnconfirmedTransactions',
        'put /': 'addTransactions'
    });

    httpApi.registerEndpoint('/api/transactions', app, router, transactionsModule.isLoaded);
}

module.exports = TransactionsHttpApi;
