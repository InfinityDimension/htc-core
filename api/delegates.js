'use strict';

var Router = require('../helpers/router');
var httpApi = require('../helpers/httpApi');

// Constructor
function DelegatesHttpApi(delegatesModule, app, logger, cache) {

    var router = new Router();

    // attach a middlware to endpoints
    router.attachMiddlwareForUrls(httpApi.middleware.useCache.bind(null, logger, cache), ['get /']);

    router.map(delegatesModule.shared, {
        'get /count': 'count',
        'get /search': 'search',
        'get /voters': 'getVoters',
        'get /get': 'getDelegate',
        'get /': 'getDelegates',
        'get /fee': 'getFee',
        'get /forging/getForgedByAccount': 'getForgedByAccount',
        'put /': 'addDelegate',
        'get /getNextForgers': 'getNextForgers'
    });

    router.map(delegatesModule.internal, {
        'post /forging/enable': 'forgingEnable',
        'post /forging/disable': 'forgingDisable',
        'get /forging/status': 'forgingStatus'
    });

    if (process.env.DEBUG) {
        router.map(delegatesModule.internal, {
            'get /forging/disableAll': 'forgingDisableAll',
            'get /forging/enableAll': 'forgingEnableAll'
        });
    }

    httpApi.registerEndpoint('/api/delegates', app, router, delegatesModule.isLoaded);
}

module.exports = DelegatesHttpApi;
