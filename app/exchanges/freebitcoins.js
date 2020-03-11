const axios = require("axios");

/**
 * 
 * @param {*} base_url (ex. https://freiexchange.com/market/orderbook)
 * @param {*} param (ex. BTC_CLAM)
 */
async function get_exchange_rate(base_url, param){

  console.log(`get_exchange_rate: ${base_url}/${param}`);

  let response = await axios.get(base_url + "/" + param);
  let data = response.data["result"];

  highestBid = data["askPrice"]
  lowestBid = data["lowPrice"]
  
  return {
    timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'Freebitcoins',
    bid: parseFloat(highestBid),
    ask: parseFloat(lowestBid)
  };
}

function calculateExchange(obj){
  return obj["price"]
}

module.exports = {
  get_exchange_rate
}

//get_exchange_rate("https://freebitcoins.com/xchange/api/ticker", "BTC_CLAM").then((obj) => {console.log(obj)})
