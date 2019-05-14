const qs = require("querystring");
const axios = require("axios");
const util = require("util");
const { encrypt_sha512 } = require("../util/common");

function nonce(){
  return new Date().getTime();
}


async function get_wallet_balance(url,api_key,secret, wallet_type, currency){

  let req_data = {
  command: 'returnCompleteBalances',
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
  console.log("returned data ",data[currency]);
  let balance = parseFloat(data[currency]['available'])+ parseFloat(data[currency]['onOrders']);

  console.log(util.format('balance - %s - %s: %d', wallet_type, currency, balance));

  return parseFloat(balance);

}

module.exports = {
  get_wallet_balance
}
