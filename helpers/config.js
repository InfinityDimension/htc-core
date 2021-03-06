

'use strict';

var fs = require('fs');
var path = require('path');
var program = require('commander');
var constants = require('../helpers/constants.js');
var configSchema = require('../schema/config.js');
var z_schema = require('./z_schema.js');
/**
 * Description of the module.
 *
 * @module
 * @see Parent: {@link helpers}
 */

/**
 * Loads config.json file.
 *
 * @param {Object} packageJson
 * @returns {OBject}
 * @todo Add description for the params and the return value
 */
function Config(packageJson) {
	program
		.version(packageJson.version)
		.option('-c, --config <path>', 'config file path')
		.option('-p, --port <port>', 'listening port number')
		.option('-h, --http-port <httpPort>', 'listening HTTP port number')
		.option('-d, --database <database>', 'database name')
		.option('-a, --address <ip>', 'listening host name or ip')
		.option('-x, --peers [peers...]', 'peers list')
		.option('-l, --log <level>', 'log level')
		.option('-s, --snapshot <round>', 'verify snapshot')
		.option('--inspect-workers', 'inspect worker processes')
		.option('--inspect-brokers', 'inspect broker processes')
		.parse(process.argv);

	var configPath = program.config;
	var appConfig = fs.readFileSync(
		path.resolve(process.cwd(), configPath || 'config.json'),
		'utf8'
	);

	if (!appConfig.length) {
		console.error('Failed to read config file');
		process.exit(1);
	} else {
		try {
			appConfig = JSON.parse(appConfig);
		} catch (err) {
			console.error('Failed to parse config file');
			console.error(err.message);
			process.exit(1);
		}
	}

	if (program.wsPort) {
		appConfig.wsPort = +program.wsPort;
	}

	if (program.httpPort) {
		appConfig.httpPort = +program.httpPort;
	}

	if (program.address) {
		appConfig.address = program.address;
	}

	if (program.database) {
		appConfig.db.database = program.database;
	}

	if (program.peers) {
		if (typeof program.peers === 'string') {
			appConfig.peers.list = program.peers.split(',').map(peer => {
				peer = peer.split(':');
				return {
					ip: peer.shift(),
					wsPort: peer.shift() || appConfig.wsPort,
				};
			});
		} else {
			appConfig.peers.list = [];
		}
	}

	if (program.log) {
		appConfig.consoleLogLevel = program.log;
	}

	if (program.snapshot) {
		appConfig.loading.snapshotRound = program.snapshot;
	}

	if (process.env.NODE_ENV === 'test') {
		appConfig.coverage = true;
	}

	if (
		appConfig.api.options.cors.origin === undefined ||
		appConfig.api.options.cors.origin === null
	) {
		appConfig.api.options.cors.origin = '*';
	}

	if (
		appConfig.api.options.cors.methods === undefined ||
		appConfig.api.options.cors.methods === null ||
		!Array.isArray(appConfig.api.options.cors.methods)
	) {
		appConfig.api.options.cors.methods = ['GET', 'POST', 'PUT'];
	}

	var validator = new z_schema();
	var valid = validator.validate(appConfig, configSchema.config);

	if (!valid) {
		console.error('Failed to validate config data', validator.getLastErrors());
		process.exit(1);
	} else {
		validateForce(appConfig);
		return appConfig;
	}
}

/**
 * Validates nethash value from constants and sets forging force to false if any.
 *
 * @private
 * @param {Object} configData
 * @todo Add description for the params
 */
function validateForce(configData) {
	if (configData.forging.force) {
		var index = constants.nethashes.indexOf(configData.nethash);

		if (index !== -1) {
			console.info('Forced forging disabled for nethash', configData.nethash);
			configData.forging.force = false;
		}
	}
}

// Exports
module.exports = Config;
