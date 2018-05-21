

'use strict';

const sql = require('../sql').votes;

/**
 * Votes database interaction class.
 *
 * @class
 * @memberof db.repos
 * @requires db/sql
 * @see Parent: {@link db.repos}
 * @param {Database} db - Instance of database object from pg-promise
 * @param {Object} pgp - pg-promise instance to utilize helpers
 * @returns {Object} An instance of a VotesRepository
 */
class VotesRepository {
	constructor(db, pgp) {
		this.db = db;
		this.pgp = pgp;

		// TODO: A proper repository shouldn't need to export any properties like this:
		this.sortFields = ['username', 'address', 'publicKey'];
	}

	/**
	 * Searches votes for delegate with an address.
	 *
	 * @param {Object} params
	 * @param {string} params.address
	 * @param {int} params.limit
	 * @param {int} params.offset
	 * @returns {Promise}
	 * @todo Add description for the params and the return value
	 */
	list(params) {
		// TODO: Should use a result-specific method, not .query
		return this.db.query(sql.getVotes, params);
	}

	/**
	 * Counts votes for a delegate with an address.
	 *
	 * @param {string} address
	 * @returns {Promise<number>}
	 * @todo Add description for the params and the return value
	 */
	count(address) {
		return this.db.one(sql.getVotesCount, address, a => +a.count);
	}
}

module.exports = VotesRepository;
