var db = require('../util/mysql_connection')
const { get_quoted_bid } = require('../foreign_exchange/quote_fx_rate');
const { base_currency } = require('../../config');
const { get_investment_by_id } = require('../models').investment_model
const { build_insert_transaction } = require('../models').transaction_model
const { get_user_by_username } = require('../models').user_model
const { get_investment_account, get_account_by_investment, create_user_account, get_account_by_id } = require('../models').account_model
const uuidv1 = require('uuid/v1');//timestamp


/**
 * API for the deposit transaction
 * @param  {string} investment_id     investment for which deposit is made
 * @param  {string} deposit_to     username to whom the deposit is made
 * @param  {float} username   username of the initiator of the deposit
 * @param  {float} amount    Amount to be deposited
 * @return {JSON}         Returns success
 */
 async function deposit_api(req, res) {

   let investment_id = req.body.investment_id
   let deposit_to = req.body.deposit_to
   let username = req.body.username
   let amount = req.body.amount

   let datetime = new Date().toMysqlFormat()

   try{
     let isSuccesful = await deposit(username,investment_id,deposit_to,amount, datetime);
     console.log("isSuccesful",isSuccesful);
     if (!isSuccesful){ throw Error ('unable to deposit amount');}
     res.send({ code: "Deposit successful" })
   }
   catch(err){
     res.status(400).send({msg: 'Deposit failed', error:err.message});
   }



 };


 async function deposit(username,investment_id,deposit_to,amount, datetime){


   try{
    let queries_with_val = []
    let transaction_event_id = uuidv1(); // ⇨ '3b99e3e0-7598-11e8-90be-95472fb3ecbd'

    console.log("deposit transaction  ",username," ",investment_id," ",deposit_to," ",amount," ",datetime);

    //check if the user is admin or not, throw error if unauthorized
    //level 0 is admin
    //level 1 is a normal user
    let user = await get_user_by_username(username);

    if(!user || user.level!=0){
     throw new Error('Not authorized to initiate deposit');
    }

    //get user account
    let deposit_account = await get_account_by_investment(deposit_to,investment_id);
    if(!deposit_account){
     //create a new user account
     let deposit_account_id = await create_user_account(deposit_to, investment_id);
     deposit_account = await get_account_by_id(deposit_account_id);
    }



    //get the corresponding investment account (i.e. similiar to clam miner) - level 1
    let investment_account = await get_investment_account(investment_id);
    let { currency } = await get_investment_by_id(investment_id);

    //get the exchange rate
    let fx_rate = await get_quoted_bid(currency, base_currency);


    let debit_query_with_vals = build_insert_transaction(investment_account.account_id, amount, 'admin', datetime, 'deposit', 'deposit',transaction_event_id, investment_id, fx_rate);
    let credit_query_with_vals = build_insert_transaction(deposit_account.account_id, amount*-1, 'admin', datetime, 'deposit', 'deposit',transaction_event_id, investment_id, fx_rate);

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
   }
   //end try
    catch(err){
      console.error(err.message);
      throw err;
   }


 }

 module.exports = {
   deposit_api,
   deposit
 }
