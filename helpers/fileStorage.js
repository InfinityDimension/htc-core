let ipfsAPI = require('ipfs-api');
let async = require('async');

/**
 * connect to ipfs
 * @param IPFSConf  ipfs配置
 * @param logger  logger
 * @param cb  callback
 * @returns {*}
 */
module.exports.connect = function (IPFSConf, logger, cb) {
    let isIpfsReady = false;
    if (!IPFSConf.enable) {
        return cb(null, {ipfsEnabled: false, ipfsClient: null});
    }

    let ipfs = ipfsAPI(IPFSConf.server);

    ipfs.id(function (err, identity) {
        if (err) {
            logger.error('ipfs connect error:', err);
            throw err;
        } else {
            logger.info('localhost IPFS identity:', identity.id);
            if (IPFSConf.swarmConnectOnStart) {
                async.each(IPFSConf.connectList, function (address, callback) {
                    ipfs.swarm.connect(address, function (err) {
                        if (err) {
                            logger.error('ipfs connect to' + address + ' failed!')
                        } else {
                            logger.info('ipfs connect to' + address + 'successful!')
                        }
                        callback();
                    })
                }, function (err) {
                    ipfs.swarm.peers(function (err, peerInfo) {
                        if (err) {
                            logger.error('ipfs connect err:', err);
                        }
                        else {
                            logger.info('ipfs swarm peers length:' + peerInfo.length);
                            logger.debug(peerInfo)
                        }
                    });
                    return cb(null, {ipfsEnabled: true, ipfsClient: ipfs});
                });
            }else {
                return cb(null, {ipfsEnabled: true, ipfsClient: ipfs});
            }
        }
    })
};