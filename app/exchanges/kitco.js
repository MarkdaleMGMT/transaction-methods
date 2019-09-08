const qs = require("querystring");
const axios = require("axios");
const cheerio = require('cheerio');

async function get_exchange_rate(base_url, param){


  let request_url = base_url.replace("{}", param); //insert the rate instead of the placeholder
  let response = await axios.get(request_url);
  const html = response.data;
  const $ = cheerio.load(html);

  let bid_rate = $(".table-price--body-table--overview-bid p:nth-child(2)").text();
  bid_rate = parseFloat(bid_rate.replace(/[^0-9.]+/g,''));
  // console.log(bid_rate);

  let ask_rate = $(".table-price--body-table--overview-ask p:nth-child(2)").text();
  ask_rate = parseFloat(ask_rate.replace(/[^0-9.]+/g,''));
  // console.log(ask_rate);

  return {
    timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'kitco',
    bid: bid_rate,
    ask: ask_rate
  };
}

get_exchange_rate('https://www.kitco.com/ssi/common/metal_price_today/spot_price_{}.stm',"GOLD_CAD");

module.exports = {
  get_exchange_rate
}
