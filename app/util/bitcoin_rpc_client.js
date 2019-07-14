const util = require('util');
var bitcoin_rpc = require('node-bitcoin-rpc')
const { host, port, rpc_user, rpc_pass } = require('../../config').bitcoin_payment_config

bitcoin_rpc.init(host, port,rpc_user, rpc_pass);

const rpc_call = util.promisify(bitcoin_rpc.call);

module.exports = {
  bitcoin_rpc,
  rpc_call
};
