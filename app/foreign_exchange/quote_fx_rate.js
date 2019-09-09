const { get_latest_quoted_rate } = require('../models').fx_quoted_rates;

async function quote_fx_rate(req,res){

  try{
    let to_currency = req.body.to_currency;
    let from_currency = req.body.from_currency;

    let rate = await get_quoted_rate(from_currency, to_currency);
    res.send({ code: "rate fetched successfully", rate });
  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({msg:err.message});
  }

}


async function get_quoted_rate(from_currency, to_currency){

  console.log("get_quoted_rate ", from_currency == to_currency);
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

   console.log("get_quoted_rate rate ",rate);
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

module.exports={
  quote_fx_rate,
  get_quoted_rate
}
