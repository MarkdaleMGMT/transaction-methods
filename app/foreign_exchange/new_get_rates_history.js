const moment = require('moment');

const { get_all_currencies } = require('../models').investment_model;
const { base_currency } = require('../../config');
const { get_currency_rates_history} = require('../models').fx_quoted_rates;
const {log_status, log_error} = require("../util/log_string")

module.exports = async function get_rates_history_api(req, res){

  try{
    let time_period_days = req.body.time_period_days;
    let rates_history = await get_rates_history(time_period_days);
    log_status("get_rates_history", "")
    res.send({ code: "success", rates_history})
  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({code:"failure" , message:err.message});
  }


}

async function get_rates_history(time_period_days){
  let currencies = await get_all_currencies();
  
  let rates_history = [];

  for(let i=0; i<currencies.length; i++){
    if(base_currency != currencies[i]){
      let rates = await get_currency_rates_history(currencies[i], base_currency, time_period_days)
      rates_history.push({ currency: currencies[i], rates: rates });
    }
  } 

  return rates_history;

}
