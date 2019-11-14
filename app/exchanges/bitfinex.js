const qs = require("querystring");
const axios = require("axios");
const util = require("util");
const { encrypt_sha384 } = require("../util/common");


function nonce(){
  return new Date().getTime().toString();
}

async function get_exchange_rate(base_url, param){

  let mod_param = param.toLowerCase().replace("_","");
  console.log("mod_param", mod_param);

  let response = await axios.get(base_url + mod_param);
  let fx_rate = response.data;



  console.log("data ",fx_rate);


  if (!fx_rate || fx_rate.length == 0){
    return null;
  }


  return {
    timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'bitfinex',
    bid: parseFloat(fx_rate['bid']),
    ask: parseFloat(fx_rate['ask'])
  };
}

async function get_wallet_balance(base_url, api_key, secret, wallet_type, currency){

  // let url = '/v1/history'
  let url = '/v1/balances'
  let req_body = {
    request: url,
    nonce: nonce(),
    currency
  };

  const payload = new Buffer.from(JSON.stringify(req_body)).toString('base64')

  let options = {
    method: 'POST',
    headers: { 'X-BFX-APIKEY': api_key, 'X-BFX-PAYLOAD': payload, 'X-BFX-SIGNATURE': encrypt_sha384(secret, payload) },
    body: JSON.stringify(req_body) ,
    url: base_url + url
  }

  // console.log("req data ",req_body);
  // console.log("options ",options);

  const response = await axios(options)
  const data = response.data;
  console.log("\nreturned response ",data);


  // console.log("returned data ",data);
  let balance = 0;

  var filteredData = data.filter(el=> {
      return el.currency == currency.toLowerCase() && el.type == 'deposit'
  });

  for(let i=0; i<filteredData.length; i++){
    balance += parseFloat(filteredData[i]['amount']);
  }



  console.log(util.format('balance - %s - %s: %d', wallet_type, currency, balance));

  return parseFloat(balance);

}

module.exports = {
  get_wallet_balance,
  get_exchange_rate
}
