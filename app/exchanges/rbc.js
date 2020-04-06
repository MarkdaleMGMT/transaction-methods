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

  let response = await axios.get(base_url+`&from=${base}&to=${target}`);
  let data = response.data

  let mid = data.amount

  return {
    // timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'rbc',
    bid: parseFloat(mid),
    ask: parseFloat(mid)
  };
}

module.exports = {
  get_exchange_rate
}