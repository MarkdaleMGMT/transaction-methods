const { host, port, rpc_user, rpc_pass } = require('../../config').clamcoin_payment_config
const { Client } = require('node-json-rpc2');
const config = {
    protocol:'http',//Optional. Will be http by default
    host:host,//Will be 127.0.0.1 by default
    user:rpc_user,//Optional, only if auth needed
    password:rpc_pass,//Optional. Can be named 'pass'. Mandatory if user is passed.
    port:port,//Will be 8443 for https or 8080 for http by default
    method:'POST'//Optional. POST by default
};

console.log("RpcClient\n",Client);

var clam_coin_rpc = new Client(config);

const rpc_call = function (method,params) {
  return new Promise(resolve => {
    clam_coin_rpc.call({method,params}, (err,result) => {

      if(err)
        throw (err)
      resolve(result)
    });
  });
}


// client.call({
//     method:'getinfo',//Mandatory
//     params:[],//Will be [] by default
//     id:'rpcExample',//Optional. By default it's a random id
//     jsonrpc:'2.0'//Optional. By default it's 2.0
// },(err, res)=>{
//     if(err){
//        //Do something
//     }
//     console.log('Data:',res);//Json parsed.
// });



/*const util = require('util');


Client = require("rpc-client");
const { host, port, rpc_user, rpc_pass } = require('../../config').clamcoin_payment_config




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
}*/

/*var clam_coin_rpc = require('node-bitcoin-rpc')
const { host, port, rpc_user, rpc_pass } = require('../../config').bitcoin_payment_config

clam_coin_rpc.init(host, port,rpc_user, rpc_pass);

const rpc_call = util.promisify(clam_coin_rpc.call);*/



module.exports = {
  clam_coin_rpc,
  rpc_call
};
