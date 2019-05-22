const { get_latest_quoted_rate } = require('../models').quoted_fx_rate;

async function get_rate(req,res){

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

  let rate = await get_latest_quoted_rate(from_currency, to_currency);
  return {
    from_to:rate.from_to,
    bid: rate.bid,
    ask: rate.ask,
    mid: rate.mid
  };
}

module.exports={
  get_rate,
  get_quoted_rate
}
