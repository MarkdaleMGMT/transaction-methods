const { get_investment_by_id } = require('../models').investment_model;
const check_bitcoin_deposit = require('./bitcoin/check_deposit');
// const check_clamcoin_deposit = require('./clamcoin/check_deposit');

module.exports = async function check_deposit_api(req, res){

  try{


    let username = req.body.username;
    let investment_id = req.body.investment_id;

    let status = await redirect_check_deposit(username, investment_id);
    res.send({ code: "Successful", status })
  }
  catch(err){
    console.error(err);
    res.status(400).send({msg: 'Error', error:err.message});
  }
};


async function redirect_check_deposit(username, investment_id){

  let investment = await get_investment_by_id(investment_id);
  let currency = investment.currency;
  let result = {};

  switch (currency) {
    case 'BTC':
      result = await check_bitcoin_deposit(username, investment_id)
      break;
    case 'CLAM':
      console.log("call clam coin check deposit");
      break;
    default:
      throw new Error("currency does not support this method");
  }

  return result;
}
