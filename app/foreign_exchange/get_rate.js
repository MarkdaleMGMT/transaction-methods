
async function get_rate(req, res){

  try{
    let to_currency = req.body.to_currency;
    let from_currency = req.body.from_currency;


    let rate = await calculate_rate(from_currency, to_currency);
    res.send({ code: "rate fetched successfully", rate })
  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({msg:err.message});
  }


}

async function calculate_rate(src_currency, target_currency){

  //TODO: implement dynamic fx rate
  if( src_currency == target_currency ):
    return 1.0

}

module.exports = {
  get_rate,
  calculate_rate
}
