const { get_accounts_per_user } = require('../models').account_model
const { get_investment_by_id } = require('../models').investment_model
const { get_balance_history } = require('../accounts/get_balance_history')

/**
 * API to fetch the balance history for a specific user for all accounts over a period of time
 * @param  {string} username     username of the user whose balance you want to fetch
 * @param  {integer} time_period time period in days
 * @return {JSON}         Balance and Status
 */
module.exports = async function balance_history_api(req, res) {


  let username = req.body.username;
  let time_period_days = req.body.time_period_days;

  try{
    console.log("inside balance history");
    let balance_history = await get_user_balance_history(username, time_period_days);
    res.send({ code: "Success", balance_history })
  }
  catch(err){
    res.status(400).send({msg: err.message});
  }



};

async function get_user_balance_history(username, time_period_days){


  let user_accounts = await get_accounts_per_user(username);
  console.log("user_accounts: ", user_accounts.length);
  let user_balance_history = [];

  for(let i=0; i < user_accounts.length; i++){

    let user_account = user_accounts[i];
    let account_id = user_account.account_id;
    let investment = await get_investment_by_id(user_account.investment_id)

    let account_balance_history = await get_balance_history(account_id, time_period_days);
    user_balance_history.push(
    {
      account_id:user_account.account_id,
      investment_id:user_account.investment_id,
      investment_name:investment.investment_name,
      account_history:account_balance_history
    });

  }

  return user_balance_history;


}
