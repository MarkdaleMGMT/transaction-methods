
var db = require('../util/mysql_connection')
// const { get_user_by_username } = require('../models').user_model
const { account_balance, get_accounts_per_user } = require('../models').account_model
const { get_all_investments } = require('../models').investment_model
const { get_quoted_rate } = require('../foreign_exchange/quote_fx_rate')
const { base_currency } = require('../../config')

/**
 * API to fetch the details for all investments on the platform for a particular user
 * @param  {string} username
 * @return {JSONArray} Investment Details and Status
 */
module.exports = async function get_investment_details(req, res) {

  let username  = req.body.username

  try{
       let investment_details = await get_user_investment_details(username);
       res.send({ code: "Success", investment_details })

  }
  catch(err){
    res.status(400).send({msg: 'Unable to fetch investment details', err});
  }


};

async function get_user_investment_details(username){

  try{

    let user_balance = []

    let user_accounts = await get_accounts_per_user(username)
    let account_hashmap = {};

    for(let i=0; i < user_accounts.length; i++){

      var account = user_accounts[i];

      console.log("account.investment_id", account.investment_id)
      account_hashmap[account.investment_id] = {
        account_id: account.account_id,
        balance : await account_balance(account.account_id)
      }
    }

    console.log("account_hashmap", account_hashmap)

    let investments = await get_all_investments()

    for(let i=0; i< investments.length; i++){

        let investment = investments[i]
        let account =  account_hashmap[investment.investment_id]
        let currency = investment.currency;
        let balance_cad = 0;
        //get the latest exchange rate from the db src:investment currency, target: CAD
        if(account){
          let quoted_rate = await get_quoted_rate(currency, base_currency);
          let exchange_rate = quoted_rate.from_to == currency+'_'+base_currency ? parseFloat(quoted_rate.bid) : parseFloat(1/quoted_rate.ask);
          balance_cad = parseFloat((exchange_rate * account.balance).toFixed(8));
        }

        user_balance.push({
          'account_id': account ? account.account_id : '',
          'investment_id':investment.investment_id,
          'investment_name':investment.investment_name,
          'balance':account? account.balance: 0,
          'balance_cad':balance_cad,
          'currency':currency

        })
    }


    return user_balance
  }
  catch(err){
    console.error(err);
    throw err;
  }
}
