const { get_all_currencies } = require('../models').investment_model;
const { base_currency } = require('../../config');
const { get_latest_quoted_rate } = require('../models').fx_quoted_rates;

module.exports = async function get_rates_in_cad_api(req, res){

  try{
    let rates = await get_rates_in_cad();
    res.send({ code: "success", rates })
  }
  catch(err){
    console.error("got err",err);
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
    console.log("rate", rate);
    let exchange_rate = 1;


    if(rate){
      if(rate.from_to == c+"_"+base_currency){
          exchange_rate = rate.bid;
      }
      else {
          exchange_rate = 1/ rate.ask;
      }

      currency_rates.push({ currency:c, rate_in_cad: parseFloat(exchange_rate).toFixed(2)});
    }



  }

  console.log("currencies ", currency_rates);


  //return the rates
  return currency_rates;

}
