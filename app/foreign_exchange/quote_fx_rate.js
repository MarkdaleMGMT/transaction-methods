const { get_latest_quoted_rate } = require('../models').fx_quoted_rates;
const {log_status, log_error} = require("../util/log_string")


async function quote_fx_rate(req,res){

  try{
   
    let to_currency = req.body.to_currency;
    let from_currency = req.body.from_currency;
    log_status("quote_fx_rate", `${from_currency}_${to_currency}`)
    let rate = await get_quoted_rate(from_currency, to_currency);
    res.send({ code: "rate fetched successfully", rate });
  }
  catch(err){
    console.error("got err",err);
    log_error("quote_fx_rate", `${from_currency}_${to_currency}`, err)
    res.status(400).send({msg:err.message});
  }

}


async function get_quoted_rate(from_currency, to_currency){

  //console.log("get_quoted_rate ", from_currency == to_currency);
  let rate = 1;
  if(from_currency == to_currency){
    rate = {
      from_to:from_currency+'_'+to_currency,
      bid: 1,
      ask: 1,
      mid: 1
    };
  }
  else{
     rate = await get_latest_quoted_rate(from_currency, to_currency);
   }

   //console.log("get_quoted_rate rate ",rate);
  if(rate){
    return {
        from_to:rate.from_to,
        bid: rate.bid,
        ask: rate.ask,
        mid: rate.mid
      };

  }
  else {
    return {
      from_to:from_currency+'_'+to_currency,
      bid: null,
      ask: null,
      mid: null
    };
  }
}


//gets the rate from currency to to currency
async function get_quoted_bid(from_currency, to_currency){

  let db_quoted_rate = await get_quoted_rate(from_currency, to_currency);
  if (db_quoted_rate.from_to == from_currency+'_'+to_currency){
    return db_quoted_rate.bid ? db_quoted_rate.bid : null
  }else{
    return db_quoted_rate.ask ? 1/db_quoted_rate.ask : null
  }
}

module.exports={
  quote_fx_rate,
  get_quoted_rate,
  get_quoted_bid
}
