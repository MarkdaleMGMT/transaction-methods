var {  get_balance } = require('../models/api_info_model');


module.exports = async function get_investment_balance(req, res){

  try{

    let investment_id = req.body.investment_id;
    let balance = await get_balance(investment_id);
    res.send({ code: "Successfully fetched balance", investment_id:investment_id , balance: balance })
  }
  catch(err){
    console.error(err);
    res.status(400).send({msg: 'Error in fetching investment balance', error:err.message});
  }
};
