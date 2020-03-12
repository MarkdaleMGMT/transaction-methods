const { get_all_currencies } = require('../models').investment_model;
const { base_currency } = require('../../config');
const { get_latest_quoted_rate } = require('../models').fx_quoted_rates;
const {log_status, log_error} = require("../util/log_string")


module.exports = async function get_rates_in_cad_api(req, res){

  try{
    log_status("get_rates_in_cad_api", '')
    let rates = await get_rates_in_cad();
    res.send({ code: "success", rates })
  }
  catch(err){    
    log_error("get_rates_in_cad_api", '', err)

    res.status(400).send({code:"failure" , message:err.message});
  }


}

async function get_rates_in_cad(){

  //Get all currency pairs on the system

  let currencies = await get_all_currencies();


  let index = currencies.indexOf(base_currency);
  if (index > -1) {
    currencies.splice(index, 1);
  }

  let currency_rates = [];

  for(let i=0; i<currencies.length; i++){

    let c = currencies[i];
    let rate = await get_latest_quoted_rate(c, base_currency);

    //parse all rates to float
    rate['bid'] = parseFloat(rate['bid'])
    rate['ask'] = parseFloat(rate['ask'])
    rate['mid'] = parseFloat(rate['mid'])

    //console.log("rate", rate);
    let exchange_rate = {
      bid:1,
      ask:1,
      mid:1
    };


    if(rate){
      if(rate.from_to == c+"_"+base_currency){
          exchange_rate['bid'] = parseFloat(rate.bid.toFixed(2));
          exchange_rate['ask'] = parseFloat(rate.ask.toFixed(2));
          exchange_rate['mid'] = parseFloat(rate.mid.toFixed(2));
      }
      else {
          exchange_rate['bid'] = parseFloat((1/ rate.ask).toFixed(2));
          exchange_rate['ask'] = parseFloat((1/rate.bid).toFixed(2));
          exchange_rate['mid'] = parseFloat((1/rate.mid).toFixed(2));
      }

      currency_rates.push({ currency:c, rate_in_cad: exchange_rate });
    }



  }

 // console.log("currencies ", currency_rates);


  //return the rates
  return currency_rates;

}
