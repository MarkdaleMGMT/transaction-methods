const qs = require("querystring");
const axios = require("axios");
const util = require("util");
const { encrypt_sha512 } = require("../util/common");
const {log_status, log_error} = require("../util/log_string")

function nonce(){
  return new Date().getTime();
}

async function get_exchange_rate(base_url, param){
  log_status("polonex get_exchange_rate", "")


  let response = await axios.get(base_url);
  let param_parts = param.split("_");
  let mod_param = param_parts[1] + "_" + param_parts[0];
  let fx_rate = response.data[mod_param];

  //console.log("data ",fx_rate);

  if (!fx_rate || fx_rate.length == 0){
    return null;
  }


  return {
    timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'poloniex',
    bid: parseFloat(fx_rate['highestBid']),
    ask: parseFloat(fx_rate['lowestAsk'])
  };
}

async function get_wallet_balance(url,api_key,secret, wallet_type, currency){

  let req_data = {
  command: 'returnCompleteBalances',//returnCompleteBalancesreturnBalances
  account:'all',
  nonce: nonce()
  };

  let str_req_data = qs.stringify(req_data);

  let options = {
    method: 'POST',
    headers: { 'Key': api_key, 'Sign': encrypt_sha512(secret, str_req_data) },
    data: str_req_data ,
    url
  }

  // console.log("req data ",str_req_data);
  // console.log("options ",options);

  const response = await axios(options)

  const data = response.data;
  //console.log("returned data ",data[currency]);
  let balance = parseFloat(data[currency]['available'])+ parseFloat(data[currency]['onOrders']);
  // let balance = parseFloat(data[currency]);
  //console.log(util.format('balance - %s - %s: %d', wallet_type, currency, balance));

  return parseFloat(balance);

}

module.exports = {
  get_wallet_balance,
  get_exchange_rate
}
