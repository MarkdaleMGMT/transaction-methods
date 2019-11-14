const axios = require("axios");
//https://tradesatoshi.com/api/public/getorderbook?market=LTC_BTC&type=both&depth=20
/**
 * 
 * @param {*} base_url (ex. https://freiexchange.com/market/orderbook/)
 * @param {*} param (ex. BTC_CLAM)
 */
async function get_exchange_rate(base_url, param){

  let param_parts = param.split("_");
  let des  = param_parts[0] //Alawys BTC
  let base  = param_parts[1]
  console.log("test");
  //console.log(`get_exchange_rate: ${base_url}${des}`);
  console.log(`${base_url}?market=${param}&type=both&depth=20`);
  try{
    console.log(`${base_url}?market=${param}&type=both&depth=20`);
    let response = await axios.get(`${base_url}?market=${param}&type=both&depth=20`);
    let buy = response.data["result"]["buy"]
    let highestBid = buy[0]["rate"]

    let sell = response.data["result"]["sell"]
    let lowestBid = sell[0]["rate"]
  
    return {
        timestamp: new Date().toMysqlFormat(),
        from_to: param,
        source: 'tradesatoshi',
        bid: parseFloat(highestBid),
        ask: parseFloat(lowestBid)
    };
  } catch (err) {
    console.log(err)
  }
  
}

module.exports = {
  get_exchange_rate
}

//get_exchange_rate("https://tradesatoshi.com/api/public/getorderbook", "LTC_BTC").then((obj) => {console.log(obj)})
