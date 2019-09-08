const { get_account_by_investment, account_balance } = require('../models').account_model;
const { get_investment_by_id } = require('../models').investment_model;
const { get_quoted_rate }  = require('../foreign_exchange/quote_fx_rate');
/**
 * API to get all the account that a particular user owns in a particular investment
 * @param  {string} username     username of the user whose account you want to fetch
 * @param  {integer} investment_id     investment id for which you want to fetch account details
 * @return {JSON}         User Accounts and Status of API Call
 */
module.exports = async function get_user_account_api(req, res) {

  let username = req.body.username;
  let investment_id = req.body.investment_id;

  try{

    let account = await get_account_details(username, investment_id);
    res.send({ code: "Success", account })
  }
  catch(err){
    res.status(400).send({code:"Error fetching account details", message: err.message});
  }

};

async function get_account_details(username, investment_id){

  let account = await get_account_by_investment(username, investment_id);
  if(!account) throw new Error("Account does not exist")
  
  let investment = await get_investment_by_id(investment_id);

  let quoted_rate = await get_quoted_rate(investment.currency, 'CAD');
  let exchange_rate = parseFloat(quoted_rate.bid);

  let account_balance_val = await account_balance(account.account_id);
  //round CAD to 2dp
  let account_balance_cad = parseFloat(account_balance_val * exchange_rate).toFixed(2);

  return {...account, account_balance: account_balance_val, account_balance_cad, exchange_rate};


}
