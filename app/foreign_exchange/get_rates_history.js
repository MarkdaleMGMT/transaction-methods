const moment = require('moment');

const { get_all_currencies } = require('../models').investment_model;
const { base_currency } = require('../../config');
const { get_latest_quoted_rate, get_quoted_rates_with_validity, get_valid_rate } = require('../models').fx_quoted_rates;
const { getDates } = require('../util/common')

module.exports = async function get_rates_history_api(req, res){

  try{

    let time_period_days = req.body.time_period_days;
    let rates_history = await get_rates_history(time_period_days);
    res.send({ code: "success", rates_history })
  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({code:"failure" , message:err.message});
  }


}
  //filter the rates by time and return it to the system
  // let valid_rate = await get_valid_rate(timestamped_rates, '2019-05-01 04:09:48');
  // return valid_rate;
  //manipulate the time periods

  //group the rates by the time period

async function get_rates_history(time_period_days){

  //initialize the start and end date
  let end_date = moment().format('YYYY-MM-DD HH:mm:ss');
  let start_date = moment().subtract(time_period_days, 'days').format('YYYY-MM-DD HH:mm:ss');

  //get the currency pairs
  let currencies = await get_all_currencies();
  let index = currencies.indexOf(base_currency);
  if (index > -1) {
    currencies.splice(index, 1);
  }

  let rates_history = [];
  let dates = getDates(start_date,end_date).reverse();

  for(let i=0; i<currencies.length; i++){

    let timestamped_rates = await get_quoted_rates_with_validity(currencies[i], base_currency);
    let rates = [];

    if(!timestamped_rates || timestamped_rates.length == 0 ){
      rates_history.push({ currency: currencies[i], rates });
      console.log("skipping to next iteration");
      continue; //move on to next iteration

    }

    console.log("timestamped_rates: ", timestamped_rates);

    rates = dates.map( date => {

      let tx_time_moment = moment(date);
      let exchange_rate = get_valid_rate(timestamped_rates, tx_time_moment.format('YYYY-MM-DD HH:mm:ss'));

      return { date: tx_time_moment.format('DD MM YYYY') , rate: parseFloat(exchange_rate.bid) }
    });

    rates_history.push({ currency: currencies[i], rates });



  } //end for


  return rates_history;

}
