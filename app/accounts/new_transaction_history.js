var db = require('../util/mysql_connection')
const dateFormat = require('dateformat');
const moment = require('moment');
const { get_account_by_id, get_accounts, get_accounts_per_user, get_accounts_by_investment } = require('../models').account_model
const { get_account_transactions, new_get_account_transactions } = require('../models').transaction_model
const { get_investment_by_id } = require('../models').investment_model


// const { get_quoted_rate } = require('../foreign_exchange/quote_fx_rate')
const { get_quoted_rates_with_validity, get_valid_rate } = require('../models').fx_quoted_rates

/**
 * API to fetch all transactions for a specific account
 * @param  {string} account_id    account for which transaction history is being retrieved
 * @return {JSON}         Transaction History
 */
 module.exports = async function transaction_history_api(req, res) {

   let account_id = null;
   let username = null;
   let investment_id = null;

   if(req.body.hasOwnProperty('account_id')){
     account_id = req.body.account_id;
   }

   if(req.body.hasOwnProperty('username')){
     username = req.body.username;
   }

   if(req.body.hasOwnProperty('investment_id')){
     investment_id = req.body.investment_id;
   }


   try{

     let transaction_history = [];
     if(account_id)
        transaction_history = await new_get_account_transactions(account_id);

     else if(username){
       transaction_history = await get_transaction_for_user(username);
     }
     else if(investment_id){
       transaction_history = await get_transaction_for_all_accounts(investment_id);
     }
     else{

        transaction_history = await get_transaction_for_all_accounts();
     }

     res.send({ code: "Success", transaction_history: transaction_history })
   }
   catch(err){
     res.status(400).send({code: 'Unable to fetch transaction history', message:err.message});
   }



 };


 function SortByDateDesc(a, b){
     var aD = new Date(a.time).getTime(), bD = new Date(b.time).getTime();
     return ((aD < bD) ? 1 : ((aD > bD) ? -1 : 0));
 }

  async function get_transaction_for_all_accounts(investment_id=null){

    let accounts = [];

    if(investment_id)
      accounts = await get_accounts_by_investment(investment_id);
    else
      accounts = await get_accounts();
    let transaction_history = [];
    for(let i=0; i<accounts.length; i++){

       let account_tx_history = await new_get_account_transactions(accounts[i].account_id);
       transaction_history = transaction_history.concat(account_tx_history);

    }

    let sorted_tx_history = transaction_history.sort(SortByDate);
    return sorted_tx_history;


  }

  async function get_transaction_for_user(username){
    let accounts = await get_accounts_per_user(username);
    let transaction_history = [];
    for(let i=0; i<accounts.length; i++){

       let account_tx_history = await new_get_account_transactions(accounts[i].account_id);
       transaction_history = transaction_history.concat(account_tx_history);

    }

    let sorted_tx_history = transaction_history.sort(SortByDateDesc);
    return sorted_tx_history;
  }
