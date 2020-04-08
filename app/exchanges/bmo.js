const axios = require("axios");
const {log_status, log_error} = require("../util/log_string")
const cheerio = require('cheerio');


/**
 * 
 * @param {*} base_url (ex. bloomber)
 * @param {*} param (ex. CAD_USD)
 */
async function get_exchange_rate(base_url, param){

  let param_parts = param.split("_");
  let base  = param_parts[0] //Alawys BTC
  let target  = param_parts[1]

  let response = await axios.get(base_url);
  let data = response.data

  //console.log(JSON.parse(data))
  let USDline = data.match(/"USD" : .*,/)[0]
  let USDnumbers = USDline.match(/\d+\.?\d*/g)
  let bid = USDnumbers[0]
  let ask = USDnumbers[1]
  return {
    // timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'bmo',
    bid: parseFloat(1/bid),
    ask: parseFloat(1/ask)
  };
}

module.exports = {
  get_exchange_rate
}
