const { get_quoted_rate } = require('./get_rate');
const { get_all_currencies } = require('../models').investment_model;

async function get_quoted_rates_api(req,res){

  try{

    let rate = await get_all_quoted_rates();
    res.send({ code: "rate fetched successfully", rate });
  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({code: "Unable to fetch quoted rates", message:err.message});
  }

}

async function get_all_quoted_rates(){

  //Get all currency pairs on the system
  let currencies = await get_all_currencies();
  let currency_pairs = generate_pairs(currencies);
  console.log(currency_pairs);

  let exchange_rates = {};
  for(let i=0 ; i<currency_pairs.length; i++){

    let currency_pair = currency_pairs[i];
    console.log(currency_pair);

    let quoted_rate = await get_quoted_rate(currency_pair.from_currency, currency_pair.to_currency);
    console.log(quoted_rate);

    let from_to = quoted_rate['from_to'];
    delete quoted_rate.from_to;
    exchange_rates[from_to] = quoted_rate;

  }


  return exchange_rates;


}

function generate_pairs(currency_list){

  let result = currency_list.reduce( (acc, v, i) =>
    acc.concat(currency_list.slice(i+1).map( (w) =>{ return {from_currency: v, to_currency: w };  })),
    []);

  return result;
}


module.exports = {
  get_quoted_rates_api
}
