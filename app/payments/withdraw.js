const { get_investment_by_id } = require('../models').investment_model;
const withdraw_bitcoin = require('./bitcoin/withdraw');
const withdraw_clamcoin = require('./clamcoin/withdraw');

module.exports = async function withdraw_currency(req, res){

  try{

    let investment_id = req.body.investment_id;
    let username = req.body.username;
    let amount = req.body.amount;
    let address = req.body.address;

    let result = await redirect_withdraw_currency(username, investment_id, amount, address);
    res.send({ code: "Successful withdrawal", result })
  }
  catch(err){
    console.error(err);
    res.status(400).send({msg: 'Error in processing withdrawal', error:err.message});
  }
};

async function redirect_withdraw_currency(username, investment_id, amount, address){
  let investment = await get_investment_by_id(investment_id);
  let currency = investment.currency;
  let result = {};

  switch (currency) {
    case 'BTC':
      result = await withdraw_bitcoin(username, investment_id, amount, address)
      break;
    case 'CLAM':
      result = await withdraw_clamcoin(username, investment_id, amount, address)
      break;
    default:
      throw new Error("currency does not support this method");
  }

  return result;
}
