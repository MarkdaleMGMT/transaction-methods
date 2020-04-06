const axios = require("axios");
const {log_status, log_error} = require("../util/log_string")

/**
 * 
 * @param {*} base_url (ex. bloomber)
 * @param {*} param (ex. CAD_USD)
 */
async function get_exchange_rate(base_url, param){

  let param_parts = param.split("_");
  let des  = param_parts[0] //Alawys BTC
  let base  = param_parts[1]

  let response = await axios.get(base_url);
  let data = response.data

  let mid = 1/data[0].price

  return {
    timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'bloomberg',
    bid: parseFloat(mid),
    ask: parseFloat(mid)
  };
}

module.exports = {
  get_exchange_rate
}