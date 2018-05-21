

'use strict';

const _ = require('lodash');

const cs = {}; // Static namespace for reusable ColumnSet objects

/**
 * Signatures transactions database interaction class.
 *
 * @class
 * @memberof db.repos
 * @requires lodash
 * @see Parent: {@link db.repos}
 * @param {Database} db - Instance of database object from pg-promise
 * @param {Object} pgp - pg-promise instance to utilize helpers
 * @returns {Object} An instance of a SignatureTransactionsRepository
 */
class SignatureTransactionsRepository {
	constructor(db, pgp) {
		this.db = db;
		this.pgp = pgp;
		this.cs = cs;
		this.dbTable = 'signatures';

		this.dbFields = ['transactionId', 'publicKey'];

		if (!cs.insert) {
			cs.insert = new pgp.helpers.ColumnSet(this.dbFields, {
				table: this.dbTable,
			});
		}
	}

	/**
	 * Saves signature transactions.
	 *
	 * @param {Array} transactions
	 * @returns {Promise<null>}
	 * Success/failure of the operation.
	 */
	save(transactions) {
		const query = () => {
			if (!_.isArray(transactions)) {
				transactions = [transactions];
			}

			transactions = transactions.map(transaction => ({
				transactionId: transaction.id,
				publicKey: Buffer.from(transaction.asset.signature.publicKey, 'hex'),
			}));

			return this.pgp.helpers.insert(transactions, this.cs.insert);
		};

		return this.db.none(query);
	}
}

module.exports = SignatureTransactionsRepository;
