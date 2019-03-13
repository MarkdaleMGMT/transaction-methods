var db = require('../util/mysql_connection')
const { build_insert_transaction } = require('../models').transaction_model
const { get_user_by_username } = require('../models').user_model
const  { get_account_by_id, get_investment_account } = require('../models').account_model
const uuidv1 = require('uuid/v1');//timestamp


/**
 * API for the deposit transaction
 * @param  {string} account_id     Account where the deposit is made to
 * @param  {float} username   username of the initiator of the deposit
 * @param  {float} amount    Amount to be deposited
 * @return {JSON}         Returns success
 */
 module.exports = async function deposit_api(req, res) {

   let account_id = req.body.account_id
   let username = req.body.username
   let amount = req.body.amount

   let datetime = new Date().toMysqlFormat()

   try{
     let isSuccesful = await deposit(username,account_id,amount,datetime);
     console.log("isSuccesful",isSuccesful);
     if (!isSuccesful){ throw Error ('unable to deposit amount');}
     res.send({ code: "Deposit successful" })
   }
   catch(err){
     res.status(400).send({msg: 'Deposit failed', error:err.message});
   }



 };


 async function deposit(username,account_id,amount,datetime){


   try{
    let queries_with_val = []
    let transaction_event_id = uuidv1(); // ⇨ '3b99e3e0-7598-11e8-90be-95472fb3ecbd'

    console.log("deposit transaction  ",username," ",account_id," ",amount," ",datetime);

    //check if the user is admin or not, throw error if unauthorized
    //level 0 is admin
    //level 1 is a normal user
    let user = await get_user_by_username(username);
    if(!user || user.level!=0){
     throw new Error('Not authorized to initiate deposit');
    }

    //get user account
    let deposit_account = await get_account_by_id(account_id);
    let investment_id = deposit_account.investment_id;

    //get the corresponding investment account (i.e. similiar to clam miner) - level 1
    let investment_account = await get_investment_account(investment_id);


    let debit_query_with_vals = build_insert_transaction(investment_account.account_id, amount, 'admin', datetime, 'deposit', 'deposit',transaction_event_id, investment_id);
    let credit_query_with_vals = build_insert_transaction(deposit_account.account_id, amount*-1, 'admin', datetime, 'deposit', 'deposit',transaction_event_id, investment_id);

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
      return false;
   }


 }
