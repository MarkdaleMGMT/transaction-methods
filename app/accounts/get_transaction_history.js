var db = require('../util/mysql_connection')
const dateFormat = require('dateformat');
const { get_account_by_id, get_accounts, get_accounts_per_user, account_balance_by_date } = require('../models').account_model
const { get_account_transactions, get_account_transactions_by_date } = require('../models').transaction_model
const { get_investment_by_id } = require('../models').investment_model
const { get_quoted_rate } = require('../foreign_exchange/get_rate')

/**
 * API to fetch all transactions for a specific account
 * @param  {string} account_id    account for which transaction history is being retrieved
 * @return {JSON}         Transaction History
 */
 module.exports = async function transaction_history_api(req, res) {

   let account_id = null;
   let username = null;
   let time_period_days = null;

   if(req.body.hasOwnProperty('account_id')){
     account_id = req.body.account_id;
   }

   if(req.body.hasOwnProperty('username')){
     username = req.body.username;
   }

   if(req.body.hasOwnProperty('time_period_days')){
     time_period_days = req.body.time_period_days;
   }





   try{

     let transaction_history = [];
     if(account_id)
        transaction_history = await get_transaction_history(account_id, time_period_days);

     else if(username){
       transaction_history = await get_transactions_for_user(username, time_period_days);
     }
     else{

        transaction_history = await get_transactions_for_all_accounts(time_period_days);
     }
     res.send({ code: "Success", transaction_history })
   }
   catch(err){
     res.status(400).send({msg: 'Unable to fetch transaction history', error:err.message});
   }



 };


 async function get_transaction_history(account_id, time_period_days){


   try{

    let account = await get_account_by_id(account_id);

    //TODO: optimize it later to perform minimal db queries
    let investment = await get_investment_by_id(account.investment_id);
    let currency = investment.currency;

    //get the latest exchange rate from the db src:investment currency, target: CAD
    let quoted_rate = await get_quoted_rate(currency, 'CAD');
    let exchange_rate = parseFloat(quoted_rate.bid);

    if(!account) throw new Error('Account does not exist');

    let account_type = account.account_type;


    let transactions = [];
    let account_balance = 0;

    console.log("time_period_days ",time_period_days);

    //if time period in days is not specified, get all transactions
    if (!time_period_days){
      console.log("time period is NULL");
      transactions = await get_account_transactions(account_id);
    }
    //else if time period is specified get the transactions within
    else {
      let dateOffset = (24*60*60*1000) * (time_period_days -1);
      let dateOffset_less_day = (24*60*60*1000) * (time_period_days);

      let end_date = new Date();
      let start_date = new Date();
      start_date.setTime(start_date.getTime() - dateOffset);
      let last_balance_date = new Date();
      last_balance_date.setTime(last_balance_date.getTime() - dateOffset_less_day);


      //convert the date to mysql format
      start_date = dateFormat(start_date,'yyyy-mm-dd');
      end_date = dateFormat(end_date,'yyyy-mm-dd');
      last_balance_date = dateFormat(last_balance_date,'yyyy-mm-dd');

      console.log("last_balance_date ",last_balance_date);
      console.log("start_date ",start_date);
      console.log("end_date ",end_date);


      //returns the latest transactions first
      transactions = await get_account_transactions_by_date(account_id, start_date, end_date);
      //reverse the transaction order
      transactions = transactions.reverse();

      //initialize account balance to the ending balance for the day before the start date
      account_balance = await account_balance_by_date(account_id, last_balance_date);
    }

    console.log("transactions ", transactions);
    console.log("starting account_balance ", account_balance);


    let transaction_history = [];


    for(let i=0; i<transactions.length; i++){
      let account_transaction = transactions[i];

      if (account_type == 'debit'){
        //debits mean increase in balance
        //credits mean decrease in balance
        account_balance += parseFloat(account_transaction.amount);
      }
      else {
        //debits mean decrease in balance
        //credits mean increase in balance
        account_balance += parseFloat(account_transaction.amount)*-1.0;
      }

      account_balance = parseFloat(account_balance.toFixed(8));

      //TODO: change to the corresponding CAD value
      let account_balance_cad = parseFloat((exchange_rate * account_balance).toFixed(8));



      let transaction_json = {
        'time':dateFormat(new Date(account_transaction.time),'dd mmm yyyy, h:MM:ss TT'),
        'description': account_transaction.memo,
        'amount':Math.abs(account_transaction.amount),
        'type': account_transaction.amount <0 ? 'credit':'debit',
        'account_balance':account_balance,
        'account_balance_cad':account_balance_cad,
        'custom_memo':account_transaction.custom_memo,
        'currency':currency,
        'username':account.username

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

 async function get_transaction_history_by_date(account_id, start_date, end_date){


   try{

    let account = await get_account_by_id(account_id);

    //TODO: optimize it later to perform minimal db queries
    let investment = await get_investment_by_id(account.investment_id);
    let currency = investment.currency;

    //get the latest exchange rate from the db src:investment currency, target: CAD
    let quoted_rate = await get_quoted_rate(currency, 'CAD');
    let exchange_rate = parseFloat(quoted_rate.bid);

    if(!account) throw new Error('Account does not exist');

    let account_type = account.account_type;


    let transactions = [];
    let account_balance = 0;

    console.log("time_period_days ",time_period_days);

    //if time period in days is not specified, get all transactions
    if (!time_period_days){
      console.log("time period is NULL");
      transactions = await get_account_transactions(account_id);
    }
    //else if time period is specified get the transactions within
    else {
      // let dateOffset = (24*60*60*1000) * (time_period_days -1);
      let dateOffset_less_day = (24*60*60*1000) * (time_period_days);

      // end_date = new Date();
      // let start_date = new Date();
      // start_date.setTime(start_date.getTime() - dateOffset);
      let last_balance_date = new Date();
      last_balance_date.setTime(start_date.getTime() - dateOffset_less_day);


      //convert the date to mysql format
      start_date = dateFormat(start_date,'yyyy-mm-dd');
      end_date = dateFormat(end_date,'yyyy-mm-dd');
      last_balance_date = dateFormat(last_balance_date,'yyyy-mm-dd');

      console.log("last_balance_date ",last_balance_date);
      console.log("start_date ",start_date);
      console.log("end_date ",end_date);


      //returns the latest transactions first
      transactions = await get_account_transactions_by_date(account_id, start_date, end_date);
      //reverse the transaction order
      transactions = transactions.reverse();

      //initialize account balance to the ending balance for the day before the start date
      account_balance = await account_balance_by_date(account_id, last_balance_date);
    }

    console.log("transactions ", transactions);
    console.log("starting account_balance ", account_balance);


    let transaction_history = [];


    for(let i=0; i<transactions.length; i++){
      let account_transaction = transactions[i];

      if (account_type == 'debit'){
        //debits mean increase in balance
        //credits mean decrease in balance
        account_balance += parseFloat(account_transaction.amount);
      }
      else {
        //debits mean decrease in balance
        //credits mean increase in balance
        account_balance += parseFloat(account_transaction.amount)*-1.0;
      }

      account_balance = parseFloat(account_balance.toFixed(8));

      let account_balance_cad = parseFloat((exchange_rate * account_balance).toFixed(8));


      //TODO: append the equivalent amount in CAD
      let transaction_json = {
        'time':dateFormat(new Date(account_transaction.time),'dd mmm yyyy, h:MM:ss TT'),
        'description': account_transaction.memo,
        'amount':Math.abs(account_transaction.amount),
        'type': account_transaction.amount <0 ? 'credit':'debit',
        'account_balance':account_balance,
        'account_balance_cad':account_balance_cad,
        'custom_memo':account_transaction.custom_memo,
        'currency':currency,
        'username':account.username

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

  async function get_transactions_for_all_accounts(time_period_days){

    let accounts = await get_accounts();
    let transaction_history = [];
    for(let i=0; i<accounts.length; i++){

       let account_tx_history = await get_transaction_history(accounts[i].account_id, time_period_days);
       transaction_history = transaction_history.concat(account_tx_history);

    }

    let sorted_tx_history = transaction_history.sort(SortByDate);
    return sorted_tx_history;


  }

  async function get_transactions_for_user(username, time_period_days){
    let accounts = await get_accounts_per_user(username);
    let transaction_history = [];
    for(let i=0; i<accounts.length; i++){

       let account_tx_history = await get_transaction_history(accounts[i].account_id, time_period_days);
       transaction_history = transaction_history.concat(account_tx_history);

    }



    let sorted_tx_history = transaction_history.sort(SortByDate);
    return sorted_tx_history;
  }



  async function get_transactions_for_user_by_date(username, start_date, end_date){
    let accounts = await get_accounts_per_user(username);
    let transaction_history = [];
    for(let i=0; i<accounts.length; i++){

       let account_tx_history = await get_transaction_history_by_date(accounts[i].account_id, start_date, end_date);
       transaction_history = transaction_history.concat(account_tx_history);

    }



    let sorted_tx_history = transaction_history.sort(SortByDate);
    return sorted_tx_history;
  }


  module.exports = {
    get_transactions_for_user_by_date,
    transaction_history_api
  }
