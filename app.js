'use strict';

const async = require('async');
const checkIpInList = require('./helpers/checkIpInList.js');
const extend = require('extend');
const fs = require('fs');
const git = require('./helpers/git.js');
const https = require('https');
const Logger = require('./logger.js');
const packageJson = require('./package.json');
const path = require('path');
const program = require('commander');
const httpApi = require('./helpers/httpApi.js');
const Sequence = require('./helpers/sequence.js');
const util = require('util');
const z_schema = require('./helpers/z_schema.js');

process.stdin.resume();

let versionBuild = fs.readFileSync(path.join(__dirname, 'build'), 'utf8');

/**
 * @property {string} - Hash of last git commit.
 */
let lastCommit = '';

if (typeof gc !== 'undefined') {
    setInterval(function () {
        gc();
    }, 60000);
}

program
    .version(packageJson.version)
    .option('-c, --config <path>', 'config file path')
    .option('-g, --genesisBlock <path>', 'genesisBlock file path')
    .option('-p, --port <port>', 'listening port number')
    .option('-a, --address <ip>', 'listening host name or ip')
    .option('-x, --peers [peers...]', 'peers list')
    .option('-l, --log <level>', 'log level')
    .option('-s, --snapshot <round>', 'verify snapshot')
    .parse(process.argv);

// 配置文件
let appConfig = require('./helpers/config.js')(program.config);

//创世块
let genesisblock = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), (program.genesisBlock || 'genesisBlock.json')), 'utf8'));

//端口设置
if (program.port) {
    appConfig.port = program.port;
}

//IP地址
if (program.address) {
    appConfig.address = program.address;
}

//种子节点
if (program.peers) {
    if (typeof program.peers === 'string') {
        appConfig.peers.list = program.peers.split(',').map(function (peer) {
            peer = peer.split(':');
            return {
                ip: peer.shift(),
                port: peer.shift() || appConfig.port
            };
        });
    } else {
        appConfig.peers.list = [];
    }
}

//控制台输出日志级别
if (program.log) {
    appConfig.consoleLogLevel = program.log;
}

if (program.snapshot) {
    appConfig.loading.snapshot = Math.abs(
        Math.floor(program.snapshot)
    );
}

// Define top endpoint availability
process.env.TOP = appConfig.topAccounts;

let config = {
    db: appConfig.db,
    cache: appConfig.redis,
    cacheEnabled: appConfig.cacheEnabled,
    ipfs: appConfig.ipfs,
    modules: {
        server: './modules/server.js',
        accounts: './modules/accounts.js',
        transactions: './modules/transactions.js',
        blocks: './modules/blocks.js',
        signatures: './modules/signatures.js',
        transport: './modules/transport.js',
        loader: './modules/loader.js',
        system: './modules/system.js',
        peers: './modules/peers.js',
        delegates: './modules/delegates.js',
        rounds: './modules/rounds.js',
        multisignatures: './modules/multisignatures.js',
        dapps: './modules/dapps.js',
        crypto: './modules/crypto.js',
        sql: './modules/sql.js',
        cache: './modules/cache.js'
    },
    api: {
        accounts: {http: './api/http/accounts.js'},
        blocks: {http: './api/http/blocks.js'},
        dapps: {http: './api/http/dapps.js'},
        delegates: {http: './api/http/delegates.js'},
        loader: {http: './api/http/loader.js'},
        multisignatures: {http: './api/http/multisignatures.js'},
        peers: {http: './api/http/peers.js'},
        server: {http: './api/http/server.js'},
        signatures: {http: './api/http/signatures.js'},
        transactions: {http: './api/http/transactions.js'},
        transport: {http: './api/http/transport.js'}
    }
};

/**
 * 新建日志处理对象
 * @type {module.exports|exports}
 */
let logger = new Logger({
    echo: appConfig.consoleLogLevel, errorLevel: appConfig.fileLogLevel,
    filename: appConfig.logFileName
});

// 获取git 最新提交代码
try {
    lastCommit = git.getLastCommit();
} catch (err) {
    logger.debug('Cannot get last git commit', err.message);
}

/**
 * Creates the express server and loads all the Modules and logic.
 * @property {object} - Domain instance.
 */
let d = require('domain').create();

d.on('error', function (err) {
    logger.fatal('Domain master', {message: err.message, stack: err.stack});
    process.exit(0);
});

d.run(function () {
    let modules = [];
    async.auto({
        /**
         * Loads `payloadHash` and generate dapp password if it is empty and required.
         * Then updates config.json with new random  password.
         */
        config: function (cb) {
            try {
                appConfig.nethash = Buffer.from(genesisblock.payloadHash, 'hex').toString('hex');
            } catch (e) {
                logger.error('Failed to assign nethash from genesis block');
                throw Error(e);
            }

            if (appConfig.dapp.masterrequired && !appConfig.dapp.masterpassword) {
                let randomstring = require('randomstring');

                appConfig.dapp.masterpassword = randomstring.generate({
                    length: 12,
                    readable: true,
                    charset: 'alphanumeric'
                });

                if (appConfig.loading.snapshot != null) {
                    delete appConfig.loading.snapshot;
                }

                fs.writeFileSync('./config.json', JSON.stringify(appConfig, null, 4));

                cb(null, appConfig);
            } else {
                cb(null, appConfig);
            }
        },

        logger: function (cb) {
            cb(null, logger);
        },

        build: function (cb) {
            cb(null, versionBuild);
        },

        /**
         * Returns hash of last git commit.
         */
        lastCommit: function (cb) {
            cb(null, lastCommit);
        },

        genesisblock: function (cb) {
            cb(null, {
                block: genesisblock
            });
        },

        public: function (cb) {
            cb(null, path.join(__dirname, 'public'));
        },

        schema: function (cb) {
            cb(null, new z_schema());
        },

        network: ['config', function (scope, cb) {
            const express = require('express');
            const compression = require('compression');  //压缩中间件
            const cors = require('cors');  //跨域相关中间件
            const app = express();

            //代码覆盖率检测
            if (appConfig.codeCoverage) {
                const im = require('istanbul-middleware');
                logger.debug('Hook loader for coverage - do not use in production environment!');
                im.hookLoader(__dirname);
                app.use('/coverage', im.createHandler());
            }

            require('./helpers/request-limiter')(app, appConfig);

            app.use(compression({level: 9}));
            app.use(cors());
            app.options('*', cors());

            const server = require('http').createServer(app);
            const io = require('socket.io')(server);

            let privateKey, certificate, https, https_io;

            if (scope.config.ssl.enabled) {
                privateKey = fs.readFileSync(scope.config.ssl.options.key);
                certificate = fs.readFileSync(scope.config.ssl.options.cert);

                https = require('https').createServer({
                    key: privateKey,
                    cert: certificate,
                    ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:' + 'ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:' + '!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
                }, app);

                https_io = require('socket.io')(https);
            }

            cb(null, {
                express: express,
                app: app,
                server: server,
                io: io,
                https: https,
                https_io: https_io
            });
        }],

        dbSequence: ['logger', function (scope, cb) {
            let sequence = new Sequence({
                onWarning: function (current, limit) {
                    scope.logger.warn('DB queue', current);
                }
            });
            cb(null, sequence);
        }],

        sequence: ['logger', function (scope, cb) {
            let sequence = new Sequence({
                onWarning: function (current, limit) {
                    scope.logger.warn('Main queue', current);
                }
            });
            cb(null, sequence);
        }],

        balancesSequence: ['logger', function (scope, cb) {
            let sequence = new Sequence({
                onWarning: function (current, limit) {
                    scope.logger.warn('Balance queue', current);
                }
            });
            cb(null, sequence);
        }],

        connect: ['config', 'public', 'genesisblock', 'logger', 'build', 'network', function (scope, cb) {
            let path = require('path');
            let bodyParser = require('body-parser');
            let methodOverride = require('method-override'); //将GET或者POST改成其他谓词PUT,DELETE等
            let queryParser = require('express-query-int');
            let randomString = require('randomstring');

            scope.nonce = randomString.generate(16);
            scope.network.app.engine('html', require('ejs').renderFile);
            scope.network.app.use(require('express-domain-middleware'));
            scope.network.app.set('view engine', 'ejs');
            scope.network.app.set('views', path.join(__dirname, 'public'));
            scope.network.app.use(scope.network.express.static(path.join(__dirname, 'public')));
            scope.network.app.use(bodyParser.raw({limit: '2mb'}));
            scope.network.app.use(bodyParser.urlencoded({extended: true, limit: '2mb', parameterLimit: 5000}));
            scope.network.app.use(bodyParser.json({limit: '2mb'}));
            scope.network.app.use(methodOverride());

            let ignore = ['id', 'name', 'lastBlockId', 'blockId', 'transactionId', 'address', 'recipientId', 'senderId', 'previousBlock'];

            scope.network.app.use(queryParser({
                parser: function (value, radix, name) {
                    if (ignore.indexOf(name) >= 0) {
                        return value;
                    }

                    // Ignore conditional fields for transactions list
                    if (/^.+?:(blockId|recipientId|senderId)$/.test(name)) {
                        return value;
                    }

                    /*eslint-disable eqeqeq */
                    if (isNaN(value) || parseInt(value) != value || isNaN(parseInt(value, radix))) {
                        return value;
                    }
                    /*eslint-enable eqeqeq */
                    return parseInt(value);
                }
            }));

            scope.network.app.use(require('./helpers/z_schema-express.js')(scope.schema));

            scope.network.app.use(httpApi.middleware.logClientConnections.bind(null, scope.logger));

            //DENY: 表示该页面不允许在 frame 中展示，即便是在相同域名的页面中嵌套也不允许。
            scope.network.app.use(httpApi.middleware.attachResponseHeader.bind(null, 'X-Frame-Options', 'DENY'));

            // 限制嵌入框架的网页
            scope.network.app.use(httpApi.middleware.attachResponseHeader.bind(null, 'Content-Security-Policy', 'frame-ancestors \'none\''));

            // API调用权限控制
            scope.network.app.use(httpApi.middleware.applyAPIAccessRules.bind(null, scope.config));

            cb();
        }],

        ed: function (cb) {
            cb(null, require('./helpers/ed.js'));
        },

        bus: ['ed', function (scope, cb) {
            let changeCase = require('change-case');
            let bus = function () {
                this.message = function () {
                    let args = [];
                    Array.prototype.push.apply(args, arguments);
                    let topic = args.shift();
                    let eventName = 'on' + changeCase.pascalCase(topic);

                    // executes the each module onBind function
                    modules.forEach(function (module) {
                        if (typeof(module[eventName]) === 'function') {
                            module[eventName].apply(module[eventName], args);
                        }
                        //执行子模块里面的方法
                        if (module.submodules) {
                            async.each(module.submodules, function (submodule) {
                                if (submodule && typeof(submodule[eventName]) === 'function') {
                                    submodule[eventName].apply(submodule[eventName], args);
                                }
                            });
                        }
                    });
                };
            };
            cb(null, new bus());
        }],

        db: function (cb) {
            let db = require('./helpers/database.js');
            db.connect(config.db, logger, cb);
        },

        /**
         * 连接redis
         * @param cb
         */
        cache: function (cb) {
            let cache = require('./helpers/cache.js');
            cache.connect(config.cacheEnabled, config.cache, logger, cb);
        },

        /**
         * 连接ipfs
         * @param cb
         */
        ipfs: function (cb) {
            let ipfs = require('./helpers/fileStorage.js');
            ipfs.connect(config.ipfs, logger, cb);
        },

        logic: ['db', 'bus', 'schema', 'genesisblock', function (scope, cb) {
            let Transaction = require('./logic/transaction.js');
            let Block = require('./logic/block.js');
            let Account = require('./logic/account.js');
            let Peers = require('./logic/peers.js');

            async.auto({
                bus: function (cb) {
                    cb(null, scope.bus);
                },
                db: function (cb) {
                    cb(null, scope.db);
                },
                ed: function (cb) {
                    cb(null, scope.ed);
                },
                logger: function (cb) {
                    cb(null, logger);
                },
                schema: function (cb) {
                    cb(null, scope.schema);
                },
                genesisblock: function (cb) {
                    cb(null, {
                        block: genesisblock
                    });
                },
                account: ['db', 'bus', 'ed', 'schema', 'genesisblock', 'logger', function (scope, cb) {
                    new Account(scope.db, scope.schema, scope.logger, cb);
                }],
                transaction: ['db', 'bus', 'ed', 'schema', 'genesisblock', 'account', 'logger', function (scope, cb) {
                    new Transaction(scope.db, scope.ed, scope.schema, scope.genesisblock, scope.account, scope.logger, cb);
                }],
                block: ['db', 'bus', 'ed', 'schema', 'genesisblock', 'account', 'transaction', function (scope, cb) {
                    new Block(scope.ed, scope.schema, scope.transaction, cb);
                }],
                peers: ['logger', function (scope, cb) {
                    new Peers(scope.logger, cb);
                }]
            }, cb);
        }],

        modules: ['network', 'connect', 'config', 'logger', 'bus', 'sequence', 'dbSequence', 'balancesSequence', 'db', 'logic', 'ipfs', 'cache', function (scope, cb) {
            let tasks = {};
            Object.keys(config.modules).forEach(function (name) {
                tasks[name] = function (cb) {
                    let d = require('domain').create();

                    d.on('error', function (err) {
                        scope.logger.fatal('Domain ' + name, {message: err.message, stack: err.stack});
                    });

                    d.run(function () {
                        logger.debug('Loading module', name);
                        let Klass = require(config.modules[name]);
                        let obj = new Klass(cb, scope);
                        modules.push(obj);
                    });
                };
            });

            async.parallel(tasks, function (err, results) {
                cb(err, results);
            });
        }],

        api: ['modules', 'logger', 'network', function (scope, cb) {
            Object.keys(config.api).forEach(function (moduleName) {
                Object.keys(config.api[moduleName]).forEach(function (protocol) {
                    let apiEndpointPath = config.api[moduleName][protocol];
                    try {
                        let ApiEndpoint = require(apiEndpointPath);
                        new ApiEndpoint(scope.modules[moduleName], scope.network.app, scope.logger, scope.modules.cache);
                    } catch (e) {
                        scope.logger.error('Unable to load API endpoint for ' + moduleName + ' of ' + protocol, e);
                    }
                });
            });

            scope.network.app.use(httpApi.middleware.errorLogger.bind(null, scope.logger));
            cb();
        }],

        ready: ['modules', 'bus', 'logic', function (scope, cb) {
            scope.bus.message('bind', scope.modules);
            scope.logic.transaction.bindModules(scope.modules);
            scope.logic.peers.bindModules(scope.modules);
            cb();
        }],

        /**
         * Once 'ready' is completed, binds and listens for connections on the
         * specified host and port for `scope.network.server`.
         */
        listen: ['ready', function (scope, cb) {
            scope.network.server.listen(scope.config.port, scope.config.address, function (err) {
                scope.logger.info('Lisk started: ' + scope.config.address + ':' + scope.config.port);

                if (!err) {
                    if (scope.config.ssl.enabled) {
                        scope.network.https.listen(scope.config.ssl.options.port, scope.config.ssl.options.address, function (err) {
                            scope.logger.info('Lisk https started: ' + scope.config.ssl.options.address + ':' + scope.config.ssl.options.port);

                            cb(err, scope.network);
                        });
                    } else {
                        cb(null, scope.network);
                    }
                } else {
                    cb(err, scope.network);
                }
            });
        }]
    }, function (err, scope) {
        if (err) {
            logger.fatal(err);
        } else {
            /**
             * Handles app instance (acts as global variable, passed as parameter).
             * @todo logic repeats: bus, ed, genesisblock, logger, schema.
             * @todo description for nonce and ready
             */
            scope.logger.info('Modules ready and launched');

            process.once('cleanup', function () {
                scope.logger.info('Cleaning up...');
                async.eachSeries(modules, function (module, cb) {
                    if (typeof(module.cleanup) === 'function') {
                        module.cleanup(cb);
                    } else {
                        setImmediate(cb);
                    }
                }, function (err) {
                    if (err) {
                        scope.logger.error(err);
                    } else {
                        scope.logger.info('Cleaned up successfully');
                    }
                    process.exit(1);
                });
            });

            process.once('SIGTERM', function () {
                process.emit('cleanup');
            });

            process.once('exit', function () {
                process.emit('cleanup');
            });

            process.once('SIGINT', function () {
                process.emit('cleanup');
            });
        }
    });
});

process.on('uncaughtException', function (err) {
    // Handle error safely
    logger.fatal('System error', {message: err.message, stack: err.stack});
    process.emit('cleanup');
});
