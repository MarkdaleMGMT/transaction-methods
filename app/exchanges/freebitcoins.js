const axios = require("axios");
const {log_status, log_error} = require("../util/log_string")

/**
 * 
 * @param {*} base_url (ex. https://freiexchange.com/market/orderbook)
 * @param {*} param (ex. BTC_CLAM)
 */
async function get_exchange_rate(base_url, param){
  log_status("freebitcoins get_exchange_rate", `${base_url}/${to}_${base}`)
  
  try {
    let split = param.split("_")
    let base = split[0]
    let to  = split[1]

    let response = await axios.get(`${base_url}/${to}_${base}`);
    let data = response.data["result"];

    highestBid = data["bidPrice"]
    lowestBid = data["askPrice"]
    
    return {
      timestamp: new Date().toMysqlFormat(),
      from_to: param,
      source: 'Freebitcoins',
      bid: parseFloat(highestBid),
      ask: parseFloat(lowestBid)
    };
  } catch (err) {
      log_error("freebitcoins get_exchange_rate", `${base_url}/${to}_${base}`, err);
      res.status(400).send({msg: err.message});
  }
  
}

function calculateExchange(obj){
  return obj["price"]
}

module.exports = {
  get_exchange_rate
}

//get_exchange_rate("https://freebitcoins.com/xchange/api/ticker", "BTC_CLAM").then((obj) => {console.log(obj)})
