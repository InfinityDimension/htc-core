

'use strict';

const _ = require('lodash');

const cs = {}; // Static namespace for reusable ColumnSet objects

/**
 * Dapps transactions database interaction class.
 *
 * @class
 * @memberof db.repos
 * @requires lodash
 * @see Parent: {@link db.repos}
 * @param {Database} db - Instance of database object from pg-promise
 * @param {Object} pgp - pg-promise instance to utilize helpers
 * @returns {Object} An instance of a DappsTransactionsRepository
 */
class DappsTransactionsRepository {
	constructor(db, pgp) {
		this.db = db;
		this.pgp = pgp;
		this.cs = cs;
		this.dbTable = 'dapps';

		this.dbFields = [
			'type',
			'name',
			'description',
			'tags',
			'link',
			'category',
			'icon',
			'transactionId',
		];

		if (!cs.insert) {
			cs.insert = new pgp.helpers.ColumnSet(this.dbFields, {
				table: this.dbTable,
			});
		}
	}

	/**
	 * Saves dapp transactions.
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
				type: transaction.asset.dapp.type,
				name: transaction.asset.dapp.name,
				description: transaction.asset.dapp.description || null,
				tags: transaction.asset.dapp.tags || null,
				link: transaction.asset.dapp.link || null,
				icon: transaction.asset.dapp.icon || null,
				category: transaction.asset.dapp.category,
				transactionId: transaction.id,
			}));
			return this.pgp.helpers.insert(transactions, this.cs.insert);
		};

		return this.db.none(query);
	}
}

module.exports = DappsTransactionsRepository;
