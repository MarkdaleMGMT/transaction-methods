var db = require('../util/mysql_connection')
const dateFormat = require('dateformat');
const { get_account_by_id } = require('../models').account_model
const { get_account_transactions } = require('../models').transaction_model
const { get_investment_by_id } = require('../models').investment_model

/**
 * API to fetch all transactions for a specific account
 * @param  {string} account_id    account for which transaction history is being retrieved
 * @return {JSON}         Transaction History
 */
 module.exports = async function transaction_history_api(req, res) {

   let account_id = req.body.account_id

   try{
     let transaction_history = await get_transaction_history(account_id);
     res.send({ code: "Success", transaction_history })
   }
   catch(err){
     res.status(400).send({msg: 'Unable to fetch transaction history', err});
   }



 };


 async function get_transaction_history(account_id){


   try{

    let account = await get_account_by_id(account_id);

    //TODO: optimize it later to perform minimal db queries
    let investment = await get_investment_by_id(account.investment_id);
    let currency = investment.currency;

    if(!account) throw new Error('Account does not exist');

    let account_type = account.account_type;

    let transactions = await get_account_transactions(account_id);
    let transaction_history = [];
    let account_balance = 0;

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



      let transaction_json = {
        'time':dateFormat(new Date(account_transaction.time),'dd mmm yyyy, h:MM:ss TT'),
        'description': account_transaction.memo,
        'amount':Math.abs(account_transaction.amount),
        'type': account_transaction.amount <0 ? 'credit':'debit',
        'account_balance':account_balance,
        'currency':currency

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
