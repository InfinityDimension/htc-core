'use strict';

/**
 * use memoryCache
 * @constructor
 */
function MemoryCache() {
    let _cache = Object.create(null);
    let _hitCount = 0;
    let _missCount = 0;
    let _size = 0;
    let _debug = false;

    /**
     * put key and value to memory
     * @param key
     * @param value
     * @param time
     * @param timeoutCallback
     * @returns {*}
     */
    this.put = function (key, value, time, timeoutCallback) {
        if (_debug) {
            console.log('caching: %s = %j (@%s)', key, value, time);
        }

        if (typeof time !== 'undefined' && (typeof time !== 'number' || isNaN(time) || time <= 0)) {
            throw new Error('Cache timeout must be a positive number');
        } else if (typeof timeoutCallback !== 'undefined' && typeof timeoutCallback !== 'function') {
            throw new Error('Cache timeout callback must be a function');
        }

        let oldRecord = _cache[key];
        if (oldRecord) {
            clearTimeout(oldRecord.timeout);
        } else {
            _size++;
        }

        let record = {
            value: value,
            expire: time + Date.now()
        };

        if (!isNaN(record.expire)) {
            record.timeout = setTimeout(function () {
                _del(key);
                if (timeoutCallback) {
                    timeoutCallback(key, value);
                }
            }.bind(this), time);
        }

        _cache[key] = record;

        return value;
    };

    /**
     * delete key
     * @param key
     * @returns {boolean}
     */
    this.del = function (key) {
        let canDelete = true;

        let oldRecord = _cache[key];
        if (oldRecord) {
            clearTimeout(oldRecord.timeout);
            if (!isNaN(oldRecord.expire) && oldRecord.expire < Date.now()) {
                canDelete = false;
            }
        } else {
            canDelete = false;
        }

        if (canDelete) {
            _del(key);
        }

        return canDelete;
    };

    function _del(key) {
        _size--;
        delete _cache[key];
    }

    /**
     * clear all
     */
    this.clear = function () {
        for (let key in _cache) {
            clearTimeout(_cache[key].timeout);
        }
        _size = 0;
        _cache = Object.create(null);
        if (_debug) {
            _hitCount = 0;
            _missCount = 0;
        }
    };

    /**
     * get value from key
     * @param key
     * @returns {null}
     */
    this.get = function (key) {
        let data = _cache[key];
        if (typeof data !== "undefined") {
            if (isNaN(data.expire) || data.expire >= Date.now()) {
                if (_debug) _hitCount++;
                return data.value;
            } else {
                // free some space
                if (_debug) _missCount++;
                _size--;
                delete _cache[key];
            }
        } else if (_debug) {
            _missCount++;
        }
        return null;
    };

    this.size = function () {
        return _size;
    };

    this.memSize = function () {
        let size = 0,
            key;
        for (key in _cache) {
            size++;
        }
        return size;
    };

    this.debug = function (bool) {
        _debug = bool;
    };

    this.hits = function () {
        return _hitCount;
    };

    this.misses = function () {
        return _missCount;
    };

    this.keys = function () {
        return Object.keys(_cache);
    };

    /**
     * output as json string
     */
    this.exportJson = function () {
        let plainJsCache = {};

        // Discard the `timeout` property.
        // Note: JSON doesn't support `NaN`, so convert it to `'NaN'`.
        for (let key in _cache) {
            let record = _cache[key];
            plainJsCache[key] = {
                value: record.value,
                expire: record.expire || 'NaN',
            };
        }

        return JSON.stringify(plainJsCache);
    };

    /**
     * import jsonData
     * @param jsonToImport
     * @param options
     */
    this.importJson = function (jsonToImport, options) {
        let cacheToImport = JSON.parse(jsonToImport);
        let currTime = Date.now();

        let skipDuplicates = options && options.skipDuplicates;

        for (let key in cacheToImport) {
            if (cacheToImport.hasOwnProperty(key)) {
                if (skipDuplicates) {
                    let existingRecord = _cache[key];
                    if (existingRecord) {
                        if (_debug) {
                            console.log('Skipping duplicate imported key \'%s\'', key);
                        }
                        continue;
                    }
                }

                let record = cacheToImport[key];

                // record.expire could be `'NaN'` if no expiry was set.
                // Try to subtract from it; a string minus a number is `NaN`, which is perfectly fine here.
                let remainingTime = record.expire - currTime;

                if (remainingTime <= 0) {
                    // Delete any record that might exist with the same key, since this key is expired.
                    this.del(key);
                    continue;
                }

                // Remaining time must now be either positive or `NaN`,
                // but `put` will throw an error if we try to give it `NaN`.
                remainingTime = remainingTime > 0 ? remainingTime : undefined;

                this.put(key, record.value, remainingTime);
            }
        }

        return this.size();
    };
}

module.exports = new MemoryCache();
module.exports.MemoryCache = MemoryCache;