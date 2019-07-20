var db = require('../util/mysql_connection')
const { build_insert_transaction } = require('../models').transaction_model
const { get_user_by_username } = require('../models').user_model
const  { get_account_by_id, get_investment_account, get_withdrawal_fees_account} = require('../models').account_model
const uuidv1 = require('uuid/v1');//timestamp

/**
 * API for withdrawal transaction
 * @param  {string} account_id     Account where the withdrawal is made from
 * @param  {float} username    username of the initiator of the withdrawal
 * @param  {float} amount    Amount to be withdrawed
 * @return {JSON}         Returns success
 */

 async function withdrawal_api(req, res) {

   let account_id = req.body.account_id
   let username = req.body.username
   let amount = req.body.amount
   let datetime = new Date().toMysqlFormat()

   try{
     let isSuccesful = await withdraw(username,account_id,amount,datetime);
     if (!isSuccesful){ throw Error ('unable to withdraw amount');}
     res.send({ code: "Withdrawal successful" })
   }
   catch(err){
     res.status(400).send({msg: 'Withdrawal failed', error:err.message});
   }




 };


 async function withdraw(username,account_id,amount,datetime){

      try{
      console.log("withdrawal transaction  ",username," ",account_id," ",amount," ",datetime);

      //check if the user is admin or not, throw error if unauthorized
      //level 0 is admin
      //level 1 is a normal user
      let user = await get_user_by_username(username);

      if(!user || user.level!=0){
       throw new Error('Not authorized to initiate withdrawal');
      }

      //get user account
      let withdrawal_account = await get_account_by_id(account_id);
      if(!withdrawal_account){
       throw new Error('Invalid account number');
      }

      let investment_id = withdrawal_account.investment_id;

      //get the corresponding investment account (i.e. similiar to clam miner) - level 1
      let investment_account = await get_investment_account(investment_id);

      let queries_with_val = []
      let transaction_event_id = uuidv1(); // ⇨ '3b99e3e0-7598-11e8-90be-95472fb3ecbd'


      let debit_query_with_vals = build_insert_transaction(withdrawal_account.account_id, amount, 'admin', datetime, 'withdrawal', 'withdrawal', transaction_event_id, investment_id);
      let credit_query_with_vals = build_insert_transaction(investment_account.account_id, amount*-1, 'admin', datetime, 'withdrawal', 'withdrawal', transaction_event_id, investment_id);

       queries_with_val.push(debit_query_with_vals);
       queries_with_val.push(credit_query_with_vals);

      let results = await db.connection.begin_transaction(queries_with_val);
      console.log("got results",results[0]);
      let rows_affected = 0;
      for(let i=0; i < results.length; i++){
        console.log("results[i]",results[i][0].affectedRows);
        rows_affected+= results[i][0].affectedRows;
      }

      console.log("rows affected",rows_affected);

      return rows_affected == queries_with_val.length;
      }//end try
       catch(err){
         console.error(err.message);
         throw err;
      }





 }

 async function withdraw_cryptocurrency(username,account_id,amount,tx_fee,withdrawal_fee, tx_id, datetime){

      try{
      console.log("withdraw_cryptocurrency  ",username," ",account_id," ",amount," ",datetime);

      //check if the user is admin or not, throw error if unauthorized
      //level 0 is admin
      //level 1 is a normal user
      let user = await get_user_by_username(username);

      if(!user || user.level!=0){
       throw new Error('Not authorized to initiate withdrawal');
      }

      //get user account
      let withdrawal_account = await get_account_by_id(account_id);
      if(!withdrawal_account){
       throw new Error('Invalid account number');
      }

      let investment_id = withdrawal_account.investment_id;

      //get the corresponding investment account (i.e. similiar to clam miner) - level 1
      let investment_account = await get_investment_account(investment_id);
      let withdraw_fees_account = await get_withdrawal_fees_account(investment_id);

      let queries_with_val = []
      let transaction_event_id = uuidv1(); // ⇨ '3b99e3e0-7598-11e8-90be-95472fb3ecbd'


      let debit_user = build_insert_transaction(withdrawal_account.account_id, parseFloat((amount+tx_fee+withdrawal_fee).toFixed(8)), 'admin', datetime, 'withdrawal', 'withdrawal', transaction_event_id, investment_id,'tx_id:'+tx_id);
      let credit_investment_account = build_insert_transaction(investment_account.account_id, parseFloat((amount+tx_fee).toFixed(8))*-1, 'admin', datetime, 'withdrawal', 'withdrawal', transaction_event_id, investment_id,'tx_id:'+tx_id);
      let credit_withdrawal_fees_account = build_insert_transaction(withdraw_fees_account.account_id, withdrawal_fee*-1, 'admin', datetime, 'withdrawal', 'withdrawal fees', transaction_event_id, investment_id,'tx_id:'+tx_id);

      queries_with_val.push(debit_user);
      queries_with_val.push(credit_investment_account);
      queries_with_val.push(credit_withdrawal_fees_account);

      let results = await db.connection.begin_transaction(queries_with_val);
      console.log("got results",results[0]);
      let rows_affected = 0;
      for(let i=0; i < results.length; i++){
        console.log("results[i]",results[i][0].affectedRows);
        rows_affected+= results[i][0].affectedRows;
      }

      console.log("rows affected",rows_affected);

      return rows_affected == queries_with_val.length;
      }//end try
       catch(err){
         console.error(err.message);
         throw err;
      }





 }


 module.exports = {
   withdrawal_api,
   withdraw,
   withdraw_cryptocurrency
 }
