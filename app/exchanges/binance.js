const qs = require("querystring");
const axios = require("axios");
const {log_status, log_error} = require("../util/log_string")

/**
param: symbol of exchange rate (eg. XZC_BTC)
**/
async function get_exchange_rate(url, param, ref_rate_gap){
  log_status("binance get_exchange_rate", `param`)

  let req_data = {
    symbol: param.replace('_','')
  };

  let str_req_data = qs.stringify(req_data);
  //console.log("str_req_data",str_req_data);

  let options = {
    method: 'GET',
    url: url + "?" + str_req_data
  }

  const response = await axios(options)
  let referenceRate = parseFloat(response.data.price);

  ref_rate_gap = parseFloat(ref_rate_gap);

  //console.log("response.data ", response.data);
  ///console.log("referenceRate ", referenceRate);
  //console.log("(1 + ref_rate_gap) ", (1 + ref_rate_gap));

  let bid_rate = referenceRate*(1 - ref_rate_gap);
  let ask_rate = referenceRate*(1 + ref_rate_gap);

  return {
    timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'binance',
    bid: bid_rate,
    ask: ask_rate
  };
}


module.exports = {
  get_exchange_rate
}
