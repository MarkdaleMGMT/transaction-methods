const qs = require("querystring");
const axios = require("axios");
const {log_status, log_error} = require("../util/log_string")

function nonce(){
  return new Date().getTime();
}

async function get_exchange_rate(base_url, param, ref_rate_gap){

  log_status("cme get_exchange_rate", "")

  let timestamp = nonce();
  let response = await axios.get(base_url,{params:{ _: timestamp}});
  let referenceRate = parseFloat(response.data.referenceRate.value);

  ref_rate_gap = parseFloat(ref_rate_gap);

  // console.log("response.data ", response.data);
  // console.log("referenceRate ", referenceRate);
  // console.log("(1 + ref_rate_gap) ", (1 + ref_rate_gap));
  // console.log("timestamp ", timestamp);

  let bid_rate = referenceRate*(1 - ref_rate_gap);
  let ask_rate = referenceRate*(1 + ref_rate_gap);

  return {
    timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'cme',
    bid: bid_rate,
    ask: ask_rate
  };
}

// get_exchange_rate('https://www.cmegroup.com/CmeWS/mvc/Bitcoin/All');

module.exports = {
  get_exchange_rate
}
