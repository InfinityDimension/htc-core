

'use strict';

/**
 * Helper module for parsing git commit information.
 *
 * @module
 * @see Parent: {@link helpers}
 * @requires child_process
 */

/**
 * Description of the namespace.
 *
 * @namespace jobsQueue
 * @memberof module:helpers/jobs_queue
 * @see Parent: {@link helpers~jobsQueue}
 */
var jobsQueue = {
	jobs: {},

	/**
	 * Returns hash of the last git commit if available.
	 *
	 * @param {string} name
	 * @param { } job
	 * @param {number} time
	 * @throws {Error} If cannot get last git commit
	 * @returns {string} Hash of last git commit
	 * @todo Add description for the params
	 */
	register(name, job, time) {
		// Check if job is already registered - we check only if property exists, because value can be undefined
		if (hasOwnProperty.call(this.jobs, name)) {
			throw new Error(`Synchronous job ${name} already registered`);
		}

		// Check if job is function, name is string and time is integer
		if (
			!job ||
			Object.prototype.toString.call(job) !== '[object Function]' ||
			typeof name !== 'string' ||
			!Number.isInteger(time)
		) {
			throw new Error('Syntax error - invalid parameters supplied');
		}

		var nextJob = function() {
			return job(() => {
				jobsQueue.jobs[name] = setTimeout(nextJob, time);
			});
		};

		jobsQueue.jobs[name] = nextJob();
		return jobsQueue.jobs[name];
	},
};

module.exports = jobsQueue;
