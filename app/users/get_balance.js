var db = require('../util/mysql_connection')
const { get_user_transactions } = require('../models').transaction_model
const { get_user_by_username } = require('../models').user_model

/**
 * API to fetch the balance for a specific user
 * @param  {string} username     Username of the user
 * @return {JSON}         Balance and Status
 */
 module.exports = async function get_user_balance_api(req, res) {

   let username = req.body.username

   try{
     let user_balance = await get_user_balance(username);
     res.send({ code: "Success", user_balance })
   }
   catch(err){
     res.status(400).send({msg: 'Unable to fetch user balance', err});
   }



 };


 async function get_user_balance(username){


   try{

      let user = await get_user_by_username(username);
      if(!user) throw new Error('User does not exist');

      let account_type = user.account_type;


      let transactions = await get_user_transactions(username);

      let total_credits = 0;
      let total_debits = 0;

      for(let i=0; i<transactions.length; i++){


        let user_transaction = transactions[i];
        if(user_transaction.amount < 0){
           total_credits += (user_transaction.amount * -1.0);
        }else{
          total_debits += user_transaction.amount;
        }

      }//end for

      let user_balance = 0;
      if (account_type == 'debit'){
        user_balance = total_debits - total_credits;
      }
      else {
        user_balance = total_credits - total_debits;
      }

      return user_balance;
   }
   catch(err){
     console.log("got err",err);
     throw err;
   }



 }
