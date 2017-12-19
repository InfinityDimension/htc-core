'use strict';

const async = require('async');
const pgp = require('pg-promise');
const path = require('path');
const jsonSql = require('json-sql')();
jsonSql.setDialect('postgresql');

// Private fields
let self, library, __private = {};

/**
 * Main account logic.
 * @param {Database} db
 * @param {ZSchema} schema
 * @param {Object} logger
 * @param {function} cb - Callback function.
 */
function Account(db, schema, logger, cb) {
    this.scope = {
        db: db,
        schema: schema,
    };

    self = this;
    library = {
        logger: logger,
    };

    this.table = 'mem_accounts';

    this.model = require('../helpers/model').account_model.model(this.table);

    // Obtains fields from model
    this.fields = this.model.map(function (field) {
        let _tmp = {};

        if (field.expression) {
            _tmp.expression = field.expression;
        } else {
            if (field.mod) {
                _tmp.expression = field.mod;
            }
            _tmp.field = field.name;
        }
        if (_tmp.expression || field.alias) {
            _tmp.alias = field.alias || field.name;
        }

        return _tmp;
    });

    // Obtains bynary fields from model
    this.binary = [];
    this.model.forEach(function (field) {
        if (field.type === 'Binary') {
            this.binary.push(field.name);
        }
    }.bind(this));

    // Obtains filters from model
    this.filter = {};
    this.model.forEach(function (field) {
        this.filter[field.name] = field.filter;
    }.bind(this));

    // Obtains conv from model
    this.conv = {};
    this.model.forEach(function (field) {
        this.conv[field.name] = field.conv;
    }.bind(this));

    // Obtains editable fields from model
    this.editable = [];
    this.model.forEach(function (field) {
        if (!field.immutable) {
            this.editable.push(field.name);
        }
    }.bind(this));

    return setImmediate(cb, null, this);
}

/**
 * Creates memory tables related to accounts:
 * - mem_accounts
 * - mem_round
 * - mem_accounts2delegates
 * - mem_accounts2u_delegates
 * - mem_accounts2multisignatures
 * - mem_accounts2u_multisignatures
 * @param {function} cb - Callback function.
 */
Account.prototype.createTables = function (cb) {
    let sql = new pgp.QueryFile(path.join(process.cwd(), 'sql', 'memoryTables.sql'), {minify: true});

    this.scope.db.query(sql).then(function () {
        return setImmediate(cb);
    }).catch(function (err) {
        library.logger.error(err.stack);
        return setImmediate(cb, 'Account#createTables error');
    });
};

/**
 * Deletes the contents of these tables:
 * - mem_round
 * - mem_accounts2delegates
 * - mem_accounts2u_delegates
 * - mem_accounts2multisignatures
 * - mem_accounts2u_multisignatures
 * @param {function} cb - Callback function.
 * @returns  cb|error.
 */
Account.prototype.removeTables = function (cb) {
    let sqles = [], sql;

    [this.table,
        'mem_round',
        'mem_accounts2delegates',
        'mem_accounts2u_delegates',
        'mem_accounts2multisignatures',
        'mem_accounts2u_multisignatures'].forEach(function (table) {
        sql = jsonSql.build({
            type: 'remove',
            table: table
        });
        sqles.push(sql.query);
    });

    this.scope.db.query(sqles.join('')).then(function () {
        return setImmediate(cb);
    }).catch(function (err) {
        library.logger.error(err.stack);
        return setImmediate(cb, 'Account#removeTables error');
    });
};

/**
 * Validates account schema.
 * @param {account} account
 * @returns {err|account} Error message or input parameter account.
 * @throws {string} If schema.validate fails, throws 'Failed to validate account schema'.
 */
Account.prototype.objectNormalize = function (account) {
    let report = this.scope.schema.validate(account, {
        id: 'Account',
        object: true,
        properties: this.filter
    });

    if (!report) {
        throw 'Failed to validate account schema: ' + this.scope.schema.getLastErrors().map(function (err) {
            return err.message;
        }).join(', ');
    }

    return account;
};

/**
 * Checks type, lenght and format from publicKey.
 * @param {publicKey} publicKey
 * @throws {string} throws one error for every check.
 */
Account.prototype.verifyPublicKey = function (publicKey) {
    if (publicKey !== undefined) {
        // Check type
        if (typeof publicKey !== 'string') {
            throw 'Invalid public key, must be a string';
        }
        // Check length
        if (publicKey.length < 64) {
            throw 'Invalid public key, must be 64 characters long';
        }
        // Check format
        try {
            Buffer.from(publicKey, 'hex');
        } catch (e) {
            throw 'Invalid public key, must be a hex string';
        }
    }
};

/**
 * Normalizes address and creates binary buffers to insert.
 * @param {Object} raw - with address and public key.
 * @returns {Object} Normalized address.
 */
Account.prototype.toDB = function (raw) {
    this.binary.forEach(function (field) {
        if (raw[field]) {
            raw[field] = Buffer.from(raw[field], 'hex');
        }
    });

    // Normalize address
    // raw.address = String(raw.address).toUpperCase();

    return raw;
};

/**
 * Gets account information for specified fields and filter criteria.
 * @param {Object} filter - Contains address.
 * @param {Object|function} fields - Table fields.
 * @param {function} cb - Callback function.
 * @returns  Returns null or Object with database data.
 */
Account.prototype.get = function (filter, fields, cb) {
    if (typeof(fields) === 'function') {
        cb = fields;
        fields = this.fields.map(function (field) {
            return field.alias || field.field;
        });
    }

    this.getAll(filter, fields, function (err, data) {
        return setImmediate(cb, err, data && data.length ? data[0] : null);
    });
};

/**
 * Gets accounts information from mem_accounts.
 * @param {Object} filter - Contains address.
 * @param {Object|function} fields - Table fields.
 * @param {function} cb - Callback function.
 * @returns  data with rows | 'Account#getAll error'.
 */
Account.prototype.getAll = function (filter, fields, cb) {
    if (typeof(fields) === 'function') {
        cb = fields;
        fields = this.fields.map(function (field) {
            return field.alias || field.field;
        });
    }

    let realFields = this.fields.filter(function (field) {
        return fields.indexOf(field.alias || field.field) !== -1;
    });

    let realConv = {};
    Object.keys(this.conv).forEach(function (key) {
        if (fields.indexOf(key) !== -1) {
            realConv[key] = this.conv[key];
        }
    }.bind(this));

    let limit, offset, sort;

    if (filter.limit > 0) {
        limit = filter.limit;
    }
    delete filter.limit;

    if (filter.offset > 0) {
        offset = filter.offset;
    }
    delete filter.offset;

    if (filter.sort) {
        sort = filter.sort;
    }
    delete filter.sort;

    // if (typeof filter.address === 'string') {
    //     filter.address = {
    //         $upper: ['address', filter.address]
    //     };
    // }

    let sql = jsonSql.build({
        type: 'select',
        table: this.table,
        limit: limit,
        offset: offset,
        sort: sort,
        alias: 'a',
        condition: filter,
        fields: realFields
    });

    this.scope.db.query(sql.query, sql.values).then(function (rows) {
        return setImmediate(cb, null, rows);
    }).catch(function (err) {
        library.logger.error(err.stack);
        return setImmediate(cb, 'Account#getAll error');
    });
};

/**
 * Sets fields for specific address in mem_accounts table.
 * @param {address} address
 * @param {Object} fields
 * @param {function} cb - Callback function.
 * @returns  cb | 'Account#set error'.
 */
Account.prototype.set = function (address, fields, cb) {
    // Verify public key
    this.verifyPublicKey(fields.publicKey);

    // Normalize address
    // address = String(address).toUpperCase();
    fields.address = address;

    let sql = jsonSql.build({
        type: 'insertorupdate',
        table: this.table,
        conflictFields: ['address'],
        values: this.toDB(fields),
        modifier: this.toDB(fields)
    });

    this.scope.db.none(sql.query, sql.values).then(function () {
        return setImmediate(cb);
    }).catch(function (err) {
        library.logger.error(err.stack);
        return setImmediate(cb, 'Account#set error');
    });
};

/**
 * Updates account from mem_account with diff data belonging to an editable field.
 * Inserts into mem_round "address", "amount", "delegate", "blockId", "round"
 * based on field balance or delegates.
 * @param {address} address
 * @param {Object} diff - Must contains only mem_account editable fields.
 * @param {function} cb - Callback function.
 * @returns |cb|done} Multiple returns: done() or error.
 */
Account.prototype.merge = function (address, diff, cb) {
    let update = {}, remove = {}, insert = {}, insert_object = {}, remove_object = {}, round = [];

    // Verify public key
    this.verifyPublicKey(diff.publicKey);

    // Normalize address
    // address = String(address).toUpperCase();

    this.editable.forEach(function (value) {
        let val, i;

        if (diff[value] !== undefined) {
            let trueValue = diff[value];
            switch (self.conv[value]) {
                case String:
                    update[value] = trueValue;
                    break;
                case Number:
                    if (isNaN(trueValue) || trueValue === Infinity) {
                        console.log(diff);
                        return setImmediate(cb, 'Encountered unsane number: ' + trueValue);
                    } else if (Math.abs(trueValue) === trueValue && trueValue !== 0) {
                        update.$inc = update.$inc || {};
                        update.$inc[value] = Math.floor(trueValue);
                        if (value === 'balance') {
                            round.push({
                                query: 'INSERT INTO mem_round ("address", "amount", "delegate", "blockId", "round") SELECT ${address}, (${amount})::bigint, "dependentId", ${blockId}, ${round} FROM mem_accounts2delegates WHERE "accountId" = ${address};',
                                values: {
                                    address: address,
                                    amount: trueValue,
                                    blockId: diff.blockId,
                                    round: diff.round
                                }
                            });
                        }
                    } else if (trueValue < 0) {
                        update.$dec = update.$dec || {};
                        update.$dec[value] = Math.floor(Math.abs(trueValue));
                        // If decrementing u_balance on account
                        if (update.$dec.u_balance) {
                            // Remove virginity and ensure marked columns become immutable
                            update.virgin = 0;
                        }
                        if (value === 'balance') {
                            round.push({
                                query: 'INSERT INTO mem_round ("address", "amount", "delegate", "blockId", "round") SELECT ${address}, (${amount})::bigint, "dependentId", ${blockId}, ${round} FROM mem_accounts2delegates WHERE "accountId" = ${address};',
                                values: {
                                    address: address,
                                    amount: trueValue,
                                    blockId: diff.blockId,
                                    round: diff.round
                                }
                            });
                        }
                    }
                    break;
                case Array:
                    if (Object.prototype.toString.call(trueValue[0]) === '[object Object]') {
                        for (i = 0; i < trueValue.length; i++) {
                            val = trueValue[i];
                            if (val.action === '-') {
                                delete val.action;
                                remove_object[value] = remove_object[value] || [];
                                remove_object[value].push(val);
                            } else if (val.action === '+') {
                                delete val.action;
                                insert_object[value] = insert_object[value] || [];
                                insert_object[value].push(val);
                            } else {
                                delete val.action;
                                insert_object[value] = insert_object[value] || [];
                                insert_object[value].push(val);
                            }
                        }
                    } else {
                        for (i = 0; i < trueValue.length; i++) {
                            let math = trueValue[i][0];
                            val = null;
                            if (math === '-') {
                                val = trueValue[i].slice(1);
                                remove[value] = remove[value] || [];
                                remove[value].push(val);
                                if (value === 'delegates') {
                                    round.push({
                                        query: 'INSERT INTO mem_round ("address", "amount", "delegate", "blockId", "round") SELECT ${address}, (-balance)::bigint, ${delegate}, ${blockId}, ${round} FROM mem_accounts WHERE address = ${address};',
                                        values: {
                                            address: address,
                                            delegate: val,
                                            blockId: diff.blockId,
                                            round: diff.round
                                        }
                                    });
                                }
                            } else if (math === '+') {
                                val = trueValue[i].slice(1);
                                insert[value] = insert[value] || [];
                                insert[value].push(val);
                                if (value === 'delegates') {
                                    round.push({
                                        query: 'INSERT INTO mem_round ("address", "amount", "delegate", "blockId", "round") SELECT ${address}, (balance)::bigint, ${delegate}, ${blockId}, ${round} FROM mem_accounts WHERE address = ${address};',
                                        values: {
                                            address: address,
                                            delegate: val,
                                            blockId: diff.blockId,
                                            round: diff.round
                                        }
                                    });
                                }
                            } else {
                                val = trueValue[i];
                                insert[value] = insert[value] || [];
                                insert[value].push(val);
                                if (value === 'delegates') {
                                    round.push({
                                        query: 'INSERT INTO mem_round ("address", "amount", "delegate", "blockId", "round") SELECT ${address}, (balance)::bigint, ${delegate}, ${blockId}, ${round} FROM mem_accounts WHERE address = ${address};',
                                        values: {
                                            address: address,
                                            delegate: val,
                                            blockId: diff.blockId,
                                            round: diff.round
                                        }
                                    });
                                }
                            }
                        }
                    }
                    break;
            }
        }
    });

    let sqles = [];

    if (Object.keys(remove).length) {
        Object.keys(remove).forEach(function (el) {
            let sql = jsonSql.build({
                type: 'remove',
                table: self.table + '2' + el,
                condition: {
                    dependentId: {$in: remove[el]},
                    accountId: address
                }
            });
            sqles.push(sql);
        });
    }

    if (Object.keys(insert).length) {
        Object.keys(insert).forEach(function (el) {
            for (let i = 0; i < insert[el].length; i++) {
                let sql = jsonSql.build({
                    type: 'insert',
                    table: self.table + '2' + el,
                    values: {
                        accountId: address,
                        dependentId: insert[el][i]
                    }
                });
                sqles.push(sql);
            }
        });
    }

    if (Object.keys(remove_object).length) {
        Object.keys(remove_object).forEach(function (el) {
            remove_object[el].accountId = address;
            let sql = jsonSql.build({
                type: 'remove',
                table: self.table + '2' + el,
                condition: remove_object[el]
            });
            sqles.push(sql);
        });
    }

    if (Object.keys(insert_object).length) {
        Object.keys(insert_object).forEach(function (el) {
            insert_object[el].accountId = address;
            for (let i = 0; i < insert_object[el].length; i++) {
                let sql = jsonSql.build({
                    type: 'insert',
                    table: self.table + '2' + el,
                    values: insert_object[el]
                });
                sqles.push(sql);
            }
        });
    }

    if (Object.keys(update).length) {
        let sql = jsonSql.build({
            type: 'update',
            table: this.table,
            modifier: update,
            condition: {
                address: address
            }
        });
        sqles.push(sql);
    }

    function done(err) {
        if (cb.length !== 2) {
            return setImmediate(cb, err);
        } else {
            if (err) {
                return setImmediate(cb, err);
            }
            self.get({address: address}, cb);
        }
    }

    let queries = sqles.concat(round).map(function (sql) {
        return pgp.as.format(sql.query, sql.values);
    }).join('');

    if (!cb) {
        return queries;
    }

    if (queries.length === 0) {
        return done();
    }

    this.scope.db.none(queries).then(function () {
        return done();
    }).catch(function (err) {
        library.logger.error(err.stack);
        return done('Account#merge error');
    });
};

/**
 * Removes an account from mem_account table based on address.
 * @param {address} address
 * @param {function} cb - Callback function.
 * @returns  Data with address | Account#remove error.
 */
Account.prototype.remove = function (address, cb) {
    let sql = jsonSql.build({
        type: 'remove',
        table: this.table,
        condition: {
            address: address
        }
    });
    this.scope.db.none(sql.query, sql.values).then(function () {
        return setImmediate(cb, null, address);
    }).catch(function (err) {
        library.logger.error(err.stack);
        return setImmediate(cb, 'Account#remove error');
    });
};

// Export
module.exports = Account;
