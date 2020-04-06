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

  let response = await axios.get("https://www.hsbc.ca/international-services/foreign-exchange-rates/");
  const html = response.data;
  const $ = cheerio.load(html);

  let data = $('#content_main_basicTable_1 > table > tbody > tr:nth-child(18)').text().trim().split("\n")
  let bid = data[2]
  let ask = data[3]

  return {
    // timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'hsbc',
    bid: parseFloat(bid),
    ask: parseFloat(ask)
  };
}

module.exports = {
  get_exchange_rate
}
