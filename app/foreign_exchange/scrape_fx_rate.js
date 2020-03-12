const { log_new_rate } = require('../models').fx_raw_rates;
const { get_exchange_api } = require('../models').api_info_model;
const { rates_by_source } = require('../models').fx_weight_model;

const axios = require("axios");
const { poloniex, bitfinex, scotiabank, cme, binance, kitco, freiexchange, tradesatoshi, freebitcoins } = require('../exchanges');
const {log_status, log_error} = require("../util/log_string")


/*
Queries exernal data sources and updates order book accordingly
*/
async function scrape_fx_rate(req, res){

  try{
    let source = req.body.source;
    let rates = req.body.rates_for;
    log_status("scrape_fx_rate", `${source}` )

    let result = await update_fx_raw_rates(source, rates);
    res.send({ code: "balance updated", result })
  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({msg:err.message});
  }


}

async function update_fx_raw_rates(source, rates){

  //get all the 'exchange' records from API table
  let exchange_api = await get_exchange_api(source);
 // console.log("exchange_api", exchange_api);
  const quote_pct = 0.1


  //populate the order book
  let base_url = exchange_api['base_url'];


  for(let i=0; i<rates.length; i++){
    let exchange_rate = null;
    let rate = rates[i];

    // console.log("rate", rate);
    // console.log("exchange_api['description']",exchange_api.description);

    if(exchange_api.description == 'scotiabank'){

      exchange_rate = await scotiabank.get_exchange_rate(base_url, rate);
    }
    else if(exchange_api.description == 'poloniex'){
      exchange_rate = await poloniex.get_exchange_rate(base_url, rate);
    }
    else if(exchange_api.description == 'bitfinex'){
      exchange_rate = await bitfinex.get_exchange_rate(base_url, rate);
    }
    else if(exchange_api.description == 'kitco'){
      exchange_rate = await kitco.get_exchange_rate(base_url, rate);
    }
    else if(exchange_api.description == 'cme'){
      let cme_config = await rates_by_source(rate.split('_')[0], rate.split('_')[1],  source);
     // console.log("cme config", cme_config);
      exchange_rate = await cme.get_exchange_rate(base_url, rate, cme_config['reference_rate_gap']);
    }
    else if(exchange_api.description == 'freiexchange'){
      exchange_rate = await freiexchange.get_exchange_rate(base_url, rate);
    }
    else if(exchange_api.description == 'binance'){
      let binance_config = await rates_by_source(rate.split('_')[0], rate.split('_')[1],  source);
     // console.log("binance config", binance_config);
      exchange_rate = await binance.get_exchange_rate(base_url, rate, binance_config['reference_rate_gap']);
    } else if(exchange_api.description == 'tradesatoshi'){
      exchange_rate = await tradesatoshi.get_exchange_rate(base_url, rate);

    } else if(exchange_api.description == 'freebitcoins'){
      exchange_rate = await freebitcoins.get_exchange_rate(base_url, rate);
      
    }
    //console.log("exchange_rate ", exchange_rate);
    if(exchange_rate){
      //insert query into the table
      let quoted_bid = (1 - quote_pct) * exchange_rate['bid']; //discount bid
      let quoted_ask = (1 + quote_pct) * exchange_rate['ask']; //gross ask
      await log_new_rate(exchange_rate['timestamp'], exchange_rate['from_to'], exchange_rate['source'], exchange_rate['bid'], exchange_rate['ask'], quoted_bid, quoted_ask);

    }else{
      //console.log("Invalid rate "+ rate +" for exchange " + source);
      let err = new Error("Invalid rate "+ rate +" for exchange " + source);
      log_error("update_fx_raw_rates", "Invalid rate "+ rate +" for exchange " + source, err)
      throw err
    }

  }


  }


  module.exports = {
    scrape_fx_rate,
    update_fx_raw_rates
  }
