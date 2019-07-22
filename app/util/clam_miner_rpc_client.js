const util = require('util');


Client = require("rpc-client");
const { host, port, rpc_user, rpc_pass } = require('../../config').clamcoin_payment_config


/*var clam_coin_rpc = require('node-bitcoin-rpc')
const { host, port, rpc_user, rpc_pass } = require('../../config').bitcoin_payment_config

clam_coin_rpc.init(host, port,rpc_user, rpc_pass);

const rpc_call = util.promisify(clam_coin_rpc.call);*/

clam_coin_rpc = new Client({host:host,port:port, protocol:"http"})
clam_coin_rpc.setBasicAuth(rpc_user, rpc_pass);


const rpc_call = function (method,param) {
  return new Promise(resolve => {
    clam_coin_rpc.call(method,param, (err,result) => {

      if(err)
        throw (err)
      resolve(result)
    });
  });
}



module.exports = {
  clam_coin_rpc,
  rpc_call
};
