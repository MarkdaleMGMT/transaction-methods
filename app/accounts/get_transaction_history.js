var db = require('../util/mysql_connection')
const dateFormat = require('dateformat');
const moment = require('moment');
const { get_account_by_id, get_accounts, get_accounts_per_user } = require('../models').account_model
const { get_account_transactions } = require('../models').transaction_model
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
   if(req.body.hasOwnProperty('account_id')){
     account_id = req.body.account_id;
   }

   if(req.body.hasOwnProperty('username')){
     username = req.body.username;
   }


   try{

     let transaction_history = [];
     if(account_id)
        transaction_history = await get_transaction_history(account_id);

     else if(username){
       transaction_history = await get_transaction_for_user(username);
     }
     else{

        transaction_history = await get_transaction_for_all_accounts();
     }
     res.send({ code: "Success", transaction_history: transaction_history.reverse() })
   }
   catch(err){
     res.status(400).send({code: 'Unable to fetch transaction history', message:err.message});
   }



 };


 async function get_transaction_history(account_id){


   try{

    let account = await get_account_by_id(account_id);

    //TODO: optimize it later to perform minimal db queries
    let investment = await get_investment_by_id(account.investment_id);
    let investment_name = investment.investment_name;
    let currency = investment.currency;

    //get the latest exchange rate from the db src:investment currency, target: CAD
    // let quoted_rate = await get_quoted_rate(currency, 'CAD');
    // let exchange_rate = parseFloat(quoted_rate.bid);
    let timestamped_quoted_rates = await get_quoted_rates_with_validity(currency, 'CAD');

    if(!account) throw new Error('Account does not exist');

    let account_type = account.account_type;

    let transactions = await get_account_transactions(account_id);
    let transaction_history = [];
    let account_balance = 0;

    for(let i=0; i<transactions.length; i++){
      let account_transaction = transactions[i];
      let { amount } = account_transaction;

      if (account_type == 'debit'){
        //debits mean increase in balance
        //credits mean decrease in balance
        account_balance += parseFloat(amount);
      }
      else {
        //debits mean decrease in balance
        //credits mean increase in balance
        account_balance += parseFloat(amount)*-1.0;
      }

      account_balance = parseFloat(account_balance.toFixed(8));

      //get the valid exchange rate based on the transaction time
      let tx_time_moment = moment(account_transaction.time);
      let exchange_rate = get_valid_rate(timestamped_quoted_rates, tx_time_moment.format('YYYY-MM-DD HH:mm:ss'));
      exchange_rate =  exchange_rate.bid;

      let account_balance_cad = parseFloat((exchange_rate * account_balance).toFixed(8));
      let amount_cad = parseFloat((exchange_rate * amount)).toFixed(8);

      let transaction_json = {
        // 'time':dateFormat(new Date(account_transaction.time),'dd mmm yyyy, h:MM:ss TT'),
        'time': tx_time_moment.format('YYYY-MM-DD HH:mm:ss A'),
        'description': account_transaction.memo,
        'amount':Math.abs(amount),
        'amount_cad':Math.abs(amount_cad),
        'type': amount <0 ? 'credit':'debit',
        'account_balance':account_balance,
        'account_balance_cad':account_balance_cad,
        'custom_memo':account_transaction.custom_memo,
        'currency':currency,
        'username':account.username,
        investment_name

      };


      transaction_history.push(transaction_json);


    }//end for

    return transaction_history;
   }
   catch(err){
     console.error(err);
     throw err;
   }



 }

 function SortByDate(a, b){
     var aD = new Date(a.time).getTime(), bD = new Date(b.time).getTime();
     return ((aD < bD) ? -1 : ((aD > bD) ? 1 : 0));
 }

  async function get_transaction_for_all_accounts(){

    let accounts = await get_accounts();
    let transaction_history = [];
    for(let i=0; i<accounts.length; i++){

       let account_tx_history = await get_transaction_history(accounts[i].account_id);
       transaction_history = transaction_history.concat(account_tx_history);

    }

    let sorted_tx_history = transaction_history.sort(SortByDate);
    return sorted_tx_history;


  }

  async function get_transaction_for_user(username){
    let accounts = await get_accounts_per_user(username);
    let transaction_history = [];
    for(let i=0; i<accounts.length; i++){

       let account_tx_history = await get_transaction_history(accounts[i].account_id);
       transaction_history = transaction_history.concat(account_tx_history);

    }



    let sorted_tx_history = transaction_history.sort(SortByDate);
    return sorted_tx_history;
  }
