const { log_new_rate } = require('../models/order_book_model');
const { get_exchange_api } = require('../models/api_access_model');

const axios = require("axios");
const { poloniex, bitfinex, scotiabank } = require('../exchanges');

module.exports = async function update_exchange_rates(req, res){

  try{
    let source = req.body.source;
    let rates = req.body.rates_for;

    let result = await update_order_book(source, rates);
    res.send({ code: "balance updated", result })
  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({msg:err.message});
  }


}

async function update_order_book(source, rates){

  //get all the 'exchange' records from API table
  let exchange_api = await get_exchange_api(source);
  console.log("exchange_api", exchange_api);
  const quote_pct = 0.1


  //populate the order book
  let base_url = exchange_api['base_url'];


  for(let i=0; i<rates.length; i++){
    let exchange_rate = null;
    let rate = rates[i];

    console.log("rate", rate);
    console.log("exchange_api['description']",exchange_api.description);

    if(exchange_api.description == 'scotiabank'){

      exchange_rate = await scotiabank.get_exchange_rate(base_url, rate);
    }
    else if(exchange_api.description == 'poloniex'){
      exchange_rate = await poloniex.get_exchange_rate(base_url, rate);
    }
    else if(exchange_api.description == 'bitfinex'){
      exchange_rate = await bitfinex.get_exchange_rate(base_url, rate);
    }
    console.log("exchange_rate ", exchange_rate);
    if(exchange_rate){
      //insert query into the table
      let quoted_bid = (1 - quote_pct) * exchange_rate['bid']; //discount bid
      let quoted_ask = (1 + quote_pct) * exchange_rate['ask']; //gross ask
      await log_new_rate(exchange_rate['timestamp'], exchange_rate['from_to'], exchange_rate['source'], exchange_rate['bid'], exchange_rate['ask'], quoted_bid, quoted_ask);

    }else{
      console.log("Invalid rate "+ rate +" for exchange " + source);
      throw new Error("Invalid rate "+ rate +" for exchange " + source);
    }

  }


  }
