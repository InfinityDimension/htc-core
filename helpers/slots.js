

'use strict';

var constants = require('./constants.js');

/**
 * Description of the module.
 *
 * @module
 * @requires helpers/constants
 * @property {number} interval - Slot time interval in seconds
 * @property {number} delegates - Active delegates from constants
 * @see Parent: {@link helpers}
 * @todo Add description for the module
 */

/**
 * Gets constant time from htc epoch.
 *
 * @private
 * @returns {number} htc epoch time
 */
function beginEpochTime() {
	var d = constants.epochTime;

	return d;
}

/**
 * Calculates time since htc epoch.
 *
 * @private
 * @param {number|undefined} time - Time in unix seconds
 * @returns {number} Current time - htc epoch time
 */
function getEpochTime(time) {
	if (time === undefined) {
		time = Date.now();
	}

	var d = beginEpochTime();
	var t = d.getTime();

	return Math.floor((time - t) / 1000);
}

module.exports = {
	interval: 10,
	delegates: constants.activeDelegates,

	/**
	 * Description of the function.
	 *
	 * @param {number} time
	 * @returns {number} htc epoch time
	 * @todo Add description for the function and the params
	 */
	getTime(time) {
		return getEpochTime(time);
	},

	/**
	 * Description of the function.
	 *
	 * @param {number} [epochTime]
	 * @returns {number} Constant time from htc epoch + input time
	 * @todo Add description for the function and the params
	 */
	getRealTime(epochTime) {
		if (epochTime === undefined) {
			epochTime = this.getTime();
		}

		var d = beginEpochTime();
		var t = Math.floor(d.getTime() / 1000) * 1000;

		return t + epochTime * 1000;
	},

	/**
	 * Description of the function.
	 *
	 * @param {number} [epochTime] - Time or
	 * @returns {number} Input time / slot interval
	 * @todo Add description for the function and the params
	 */
	getSlotNumber(epochTime) {
		if (epochTime === undefined) {
			epochTime = this.getTime();
		}

		return Math.floor(epochTime / this.interval);
	},

	/**
	 * Description of the function.
	 *
	 * @param {number} slot - Slot number
	 * @returns {number} Input slot * slot interval
	 * @todo Add description for the function and the params
	 */
	getSlotTime(slot) {
		return slot * this.interval;
	},

	/**
	 * Description of the function.
	 *
	 * @returns {number} Current slot number + 1
	 * @todo Add description for the function and the params
	 */
	getNextSlot() {
		var slot = this.getSlotNumber();

		return slot + 1;
	},

	/**
	 * Description of the function.
	 *
	 * @param {number} nextSlot
	 * @returns {number} Input next slot + delegates
	 * @todo Add description for the function and the params
	 */
	getLastSlot(nextSlot) {
		return nextSlot + this.delegates;
	},

	/**
	 * Description of the function.
	 *
	 * @param {number} nextSlot
	 * @returns {number} Input next slot + delegates
	 * @todo Add description for the function and the params
	 */
	roundTime(date) {
		return Math.floor(date.getTime() / 1000) * 1000;
	},

	/**
	 * Calculates round number from the given height.
	 *
	 * @param {number} height - Height from which round is calculated
	 * @returns {number} Round number
	 * @todo Add description for the params
	 *
	 */
	calcRound(height) {
		return Math.ceil(height / this.delegates);
	},
};
