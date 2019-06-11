const { get_investment_by_id } = require('../models').investment_model;
const get_bitcoin_deposit_address = require('./bitcoin/get_deposit_address');
// const get_clamcoin_deposit_address = require('./clamcoin/get_deposit_address');


module.exports = async function get_deposit_address_api(req, res){

  try{

    let investment_id = req.body.investment_id;
    let username = req.body.username;

    console.log("investment_id", investment_id);
    console.log("username", username);
    let deposit_address = await redirect_get_deposit_address(username, investment_id);
    res.send({ code: "Successfully fetched deposit address", deposit_address:deposit_address })
  }
  catch(err){
    console.error(err);
    res.status(400).send({msg: 'Error in generating deposit address', error:err.message});
  }
};

async function redirect_get_deposit_address(username, investment_id){

    let investment = await get_investment_by_id(investment_id);
    let currency = investment.currency;
    let result = {};

    switch (currency) {
      case 'BTC':
        result = await get_bitcoin_deposit_address(username, investment_id)
        break;
      case 'CLAM':
        console.log("call clam coin get deposit address");
        break;
      default:
        throw new Error("currency does not support this method");
    }

    return result;
}
