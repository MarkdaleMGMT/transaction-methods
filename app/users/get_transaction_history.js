var db = require('../util/mysql_connection')
const { get_user_transactions } = require('../models').transaction_model

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

      let transactions = await get_user_transactions(username);
      let transaction_history = [];
      let user_balance = 0;

      for(let i=0; i<transactions.length; i++){
        let user_transaction = transactions[i];

        user_balance += parseFloat(user_transaction.amount);

        let transaction_json = {
          'time':user_transaction.time,
          'transaction_type': user_transaction.memo,
          'amount':user_transaction.amount,
          'user_balance':user_balance

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
