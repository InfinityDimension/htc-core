

'use strict';

var bignum = require('./bignum');
var slots = require('./slots');
var exceptions = require('./exceptions');

/**
 * Sets round fees and rewards.
 *
 * @class
 * @memberof helpers
 * @requires helpers/bignum
 * @requires helpers/exceptions
 * @requires helpers/slots
 * @param {Object} scope
 * @see Parent: {@link helpers}
 * @todo Add description for the params
 */
// Constructor
function RoundChanges(scope) {
	this.roundFees = Math.floor(scope.roundFees) || 0;
	this.roundRewards = scope.roundRewards || [];

	// Apply exception for round if required
	if (exceptions.rounds[scope.round]) {
		// Apply rewards factor
		this.roundRewards.forEach((reward, index) => {
			this.roundRewards[index] = new bignum(reward.toPrecision(15))
				.times(exceptions.rounds[scope.round].rewards_factor)
				.floor();
		});

		// Apply fees factor and bonus
		this.roundFees = new bignum(this.roundFees.toPrecision(15))
			.times(exceptions.rounds[scope.round].fees_factor)
			.plus(exceptions.rounds[scope.round].fees_bonus)
			.floor();
	}
}

// Public methods
/**
 * Calculates rewards at round position.
 * Fees and feesRemaining based on slots.
 *
 * @param {number} index
 * @returns {Object} With fees, feesRemaining, rewards, balance
 * @todo Add description for the params
 */
RoundChanges.prototype.at = function(index) {
	var fees = new bignum(this.roundFees.toPrecision(15))
		.dividedBy(slots.delegates)
		.floor();
	var feesRemaining = new bignum(this.roundFees.toPrecision(15)).minus(
		fees.times(slots.delegates)
	);
	var rewards =
		new bignum(this.roundRewards[index].toPrecision(15)).floor() || 0;

	return {
		fees: Number(fees.toFixed()),
		feesRemaining: Number(feesRemaining.toFixed()),
		rewards: Number(rewards.toFixed()),
		balance: Number(fees.add(rewards).toFixed()),
	};
};

module.exports = RoundChanges;
