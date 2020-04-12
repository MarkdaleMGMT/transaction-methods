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
  const html = response.data;
  const $ = cheerio.load(html);

  let data = $('#main-wrapper > section > div > article > div.printablecontent > div > div.table.parbase.section > div > table > tbody > tr:nth-child(3)').text().trim().split("\n")
  let ask = data[2]
  let bid = data[3]
  
  return {
    // timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'nbc',
   bid: parseFloat(1/bid),
    ask: parseFloat(1/ask)
  };
}

module.exports = {
  get_exchange_rate
}

get_exchange_rate("asd", "das")