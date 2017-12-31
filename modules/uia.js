let transactionTypes = require('../helpers/transactionTypes.js');

// Private fields
let modules, library, self, __private = {};

__private.loaded = false;
__private.assetTypes = {};

/**
 * Constructor
 * @param cb
 * @param scope
 * @constructor
 */
function Uia(cb, scope) {
    library = {
        logic: {
            transaction: scope.logic.transaction,
        },
        logger:scope.logger,
    };
    self = this;
    setImmediate(cb, null, self);
}

Uia.prototype.onBind = function (scope) {
    __private.loaded = true;
};

Uia.prototype.isLoaded = function () {
    return __private.loaded;
};


// Export
module.exports = Uia;