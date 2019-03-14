const dateFormat = require('dateformat');

var db = require('../util/mysql_connection')
const { get_user_transactions } = require('../models').transaction_model
const { get_user_by_username } = require('../models').user_model

/**
 * API to fetch all transactions for a specific user
 * @param  {string} username     Username of the user whose transaction history is being retrieved
 * @return {JSON}         Transaction History
 */
 module.exports = async function transaction_history_api(req, res) {

   let username = req.body.username

   try{
     let transaction_history = await get_transaction_history(username);
     res.send({ code: "Success", transaction_history })
   }
   catch(err){
     res.status(400).send({msg: 'Unable to fetch transaction history', err});
   }



 };


 async function get_transaction_history(username){


   try{

     let user = await get_user_by_username(username);
     if(!user) throw new Error('User does not exist');

     let account_type = user.account_type;

    let transactions = await get_user_transactions(username);
    let transaction_history = [];
    let user_balance = 0;

    for(let i=0; i<transactions.length; i++){
      let user_transaction = transactions[i];

      if (account_type == 'debit'){
        //debits mean increase in balance
        //credits mean decrease in balance
        user_balance += parseFloat(user_transaction.amount);
      }
      else {
        //debits mean decrease in balance
        //credits mean increase in balance
        user_balance += parseFloat(user_transaction.amount)*-1.0;
      }



      let transaction_json = {
        'time':dateFormat(new Date(user_transaction.time),'dd mmm yyyy, h:MM:ss TT'),
        'description': user_transaction.memo,
        'amount':Math.abs(user_transaction.amount),
        'type': user_transaction.amount <0 ? 'credit':'debit',
        'user_balance':parseFloat(user_balance.toFixed(8)),
        'transaction_event_id':user_transaction.transaction_event_id

      };


      transaction_history.push(transaction_json);


    }//end for

    return transaction_history;
   }
   catch(err){
     console.log("got err",err);
     throw err;
   }



 }
