

'use strict';

const path = require('path');
const QueryFile = require('pg-promise').QueryFile;

const sqlRoot = __dirname;

/**
 * Provides dynamic link to an SQL file.
 *
 * @memberof db.sql
 * @param {Object} file
 * @returns {Object} QueryFile
 * @todo Add description for params and return value
 */
function link(file) {
	const fullPath = path.join(sqlRoot, file); // Generating full path;

	const options = {
		minify: true, // Minifies the SQL
	};

	const qf = new QueryFile(fullPath, options);

	if (qf.error) {
		console.error(qf.error); // Something is wrong with our query file
		process.exit(1); // Exit the process with fatal error
	}

	return qf;
}

module.exports = { link, sqlRoot };
