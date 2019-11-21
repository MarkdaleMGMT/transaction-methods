var db = require('../util/mysql_connection')
const { build_insert_transaction, get_derived_balance } = require('../models').transaction_model
const { get_user_by_username } = require('../models').user_model
const  { get_account_by_id, get_investment_account, get_withdrawal_fees_account, get_account_by_investment} = require('../models').account_model
const uuidv1 = require('uuid/v1');//timestamp

const { get_quoted_bid } = require('../foreign_exchange/quote_fx_rate');
const { base_currency } = require('../../config');
const { get_investment_by_id } = require('../models').investment_model
const { build_insert_balance } = require('../models').account_balance_model
/**
 * API for withdrawal transaction
 * @param  {string} withdraw_from     username from whose account the amount will be withdrawn from
 * @param  {integer} investment_id investment for the withdrawal transaction
 * @param  {float} username    username of the initiator of the withdrawal
 * @param  {float} amount    Amount to be withdrawed
 * @return {JSON}         Returns success
 */

 async function withdrawal_api(req, res) {

   let withdraw_from = req.body.withdraw_from
   let investment_id = req.body.investment_id
   let username = req.body.username
   let amount = req.body.amount
   let datetime = new Date().toMysqlFormat()

   try{
     let isSuccesful = await withdraw(username, withdraw_from, investment_id ,amount,datetime);
     if (!isSuccesful){ throw Error ('unable to withdraw amount');}
     res.send({ code: "Withdrawal successful" })
   }
   catch(err){
     res.status(400).send({msg: 'Withdrawal failed', error:err.message});
   }




 };


 async function withdraw(username,withdraw_from, investment_id ,amount,datetime){

      try{
      console.log("withdrawal transaction  ",username," ",withdraw_from," ",investment_id," ",amount," ",datetime);

      //check if the user is admin or not, throw error if unauthorized
      //level 0 is admin
      //level 1 is a normal user
      let user = await get_user_by_username(username);

      if(!user || user.level!=0){
       throw new Error('Not authorized to initiate withdrawal');
      }

      //get user account

      let withdrawal_account = await get_account_by_investment(withdraw_from, investment_id);
      if(!withdrawal_account){
       throw new Error('User does not own an account in this investment');
      }

      // let investment_id = withdrawal_account.investment_id;

      //get the corresponding investment account (i.e. similiar to clam miner) - level 1
      let investment_account = await get_investment_account(investment_id);
      let { currency } = await get_investment_by_id(investment_id);
      let fx_rate = await get_quoted_bid(currency, base_currency);


      let queries_with_val = []
      let transaction_event_id = uuidv1(); // ⇨ '3b99e3e0-7598-11e8-90be-95472fb3ecbd'


      let debit_query_with_vals = build_insert_transaction(withdrawal_account.account_id, amount, 'admin', datetime, 'withdrawal', 'withdrawal', transaction_event_id, investment_id, fx_rate);
      let credit_query_with_vals = build_insert_transaction(investment_account.account_id, amount*-1, 'admin', datetime, 'withdrawal', 'withdrawal', transaction_event_id, investment_id, fx_rate);

      queries_with_val.push(debit_query_with_vals);
      queries_with_val.push(credit_query_with_vals);


      //logging the new balances
      let debit_balance = parseFloat(await get_derived_balance(withdrawal_account.account_id)) + amount
      let credit_balance = parseFloat(await get_derived_balance(investment_account.account_id)) + amount*-1 ;



      let debit_query_balance = build_insert_balance(datetime, withdrawal_account.account_id, investment_id, -1.0*amount, debit_balance*-1, fx_rate, transaction_event_id);
      let credit_query_balance = build_insert_balance(datetime, investment_account.account_id, investment_id, -1.0*amount,  credit_balance, fx_rate, transaction_event_id);

      queries_with_val.push(debit_query_balance);
      queries_with_val.push(credit_query_balance);

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
      let {currency} = await get_investment_by_id(investment_id);
      let fx_rate = await get_quoted_bid(currency, base_currency);

      //get the corresponding investment account (i.e. similiar to clam miner) - level 1
      let investment_account = await get_investment_account(investment_id);
      let withdraw_fees_account = await get_withdrawal_fees_account(investment_id);

      let queries_with_val = []
      let transaction_event_id = uuidv1(); // ⇨ '3b99e3e0-7598-11e8-90be-95472fb3ecbd'


      let debit_user = build_insert_transaction(withdrawal_account.account_id, parseFloat((amount+tx_fee+withdrawal_fee).toFixed(8)), 'admin', datetime, 'withdrawal', 'withdrawal', transaction_event_id, investment_id, fx_rate, 'tx_id:'+tx_id);
      let credit_investment_account = build_insert_transaction(investment_account.account_id, parseFloat((amount+tx_fee).toFixed(8))*-1, 'admin', datetime, 'withdrawal', 'withdrawal', transaction_event_id, investment_id, fx_rate, 'tx_id:'+tx_id);
      let credit_withdrawal_fees_account = build_insert_transaction(withdraw_fees_account.account_id, withdrawal_fee*-1, 'admin', datetime, 'withdrawal', 'withdrawal fees', transaction_event_id, investment_id, fx_rate, 'tx_id:'+tx_id);

      queries_with_val.push(debit_user);
      queries_with_val.push(credit_investment_account);
      queries_with_val.push(credit_withdrawal_fees_account);



      //logging the new balances
      let debit_user_balance = parseFloat(await get_derived_balance(withdrawal_account.account_id)) + (amount+tx_fee+withdrawal_fee) //credit account
      let credit_investment_balance = parseFloat(await get_derived_balance(investment_account.account_id)) + (amount+tx_fee)*-1 ; //debit account
      let credit_withdrawal_fee_balance = parseFloat(await get_derived_balance(withdraw_fees_account.account_id)) + withdrawal_fee //credit account

      let debit_user_balance_q = build_insert_balance(datetime, withdrawal_account.account_id, investment_id, -1.0*(amount+tx_fee+withdrawal_fee), debit_user_balance*-1, fx_rate, transaction_event_id);
      let credit_investment_balance_q = build_insert_balance(datetime, investment_account.account_id, investment_id, -1.0*(amount+tx_fee),  credit_investment_balance, fx_rate, transaction_event_id);
      let credit_withdrawal_fee_balance_q = build_insert_balance(datetime, withdraw_fees_account.account_id, investment_id, -1.0*(withdrawal_fee),  credit_withdrawal_fee_balance*-1, fx_rate, transaction_event_id);

      queries_with_val.push(debit_user_balance_q);
      queries_with_val.push(credit_investment_balance_q);
      queries_with_val.push(credit_withdrawal_fee_balance_q);

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
