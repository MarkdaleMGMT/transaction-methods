const axios = require("axios");
const {log_status, log_error} = require("../util/log_string")

/**
 * 
 * @param {*} base_url (ex. https://prohashing.com/explorer/Clam/xNvJFG4T7Fun5AfANznHXmVvoErexh5WT2/)
 * @param {*} param (ex. CAD_CLAM)
 */
async function get_exchange_rate(base_url, param){
  
  
  try {
    let split = param.split("_")
    let base = split[0]
    let to  = split[1]
    log_status("prohashing get_exchange_rate", `${base_url}/${to}_${base}`)

    let response = await axios.get(`${base_url}/${to}_${base}`);
    let data = response.data["result"];

    highestBid = data["bidPrice"]
    lowestBid = data["askPrice"]
    
    return {
      timestamp: new Date().toMysqlFormat(),
      from_to: param,
      source: 'prohashing',
      bid: parseFloat(highestBid),
      ask: parseFloat(lowestBid)
    };
  } catch (err) {
      log_error("prohashing get_exchange_rate", `${base_url}/${to}_${base}`, err);
      res.status(400).send({msg: err.message});
  }
  
}

function calculateExchange(obj){
  return obj["price"]
}

module.exports = {
  get_exchange_rate
}
