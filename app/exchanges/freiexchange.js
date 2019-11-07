const axios = require("axios");

/**
 * 
 * @param {*} base_url (ex. https://freiexchange.com/market/orderbook/)
 * @param {*} param (ex. BTC_CLAM)
 */
async function get_exchange_rate(base_url, param){

  let param_parts = param.split("_");
  let des  = param_parts[0] //Alawys BTC
  let base  = param_parts[1]

  console.log(`get_exchange_rate: ${base_url}${des}`);

  let response = await axios.get(base_url + des);
  let data = response.data;
  console.log(data)

  //Get highest bid
  let highestBid = data["buy"].length == 0 ? 0 : calculateExchange(data["buy"][0])
  let i = 0;
  let curExchange;
  for (i; i < data["buy"].length; i++){
    curExchange = calculateExchange(data["buy"][i])
    highestBid = curExchange > highestBid? curExchange : highestBid
  }  

  //Get lowest offer
  i = 0
  let lowestBid = data["sell"].length == 0 ? Infinity : calculateExchange(data["sell"][0])
  for (i; i < data["sell"].length; i++){
    curExchange = calculateExchange(data["sell"][i])
    lowestBid = curExchange < lowestBid? curExchange : lowestBid
  }  

  return {
    timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'Frei Exchange',
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

get_exchange_rate("https://freiexchange.com/market/orderbook/", "CLAM_BTC").then((obj) => {console.log(obj)})
