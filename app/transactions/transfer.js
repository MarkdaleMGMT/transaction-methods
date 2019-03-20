var db = require('../util/mysql_connection')
const { build_insert_transaction } = require('../models').transaction_model;
const { get_user_by_username } = require('../models').user_model;
const { get_account_by_investment, account_balance, create_user_account } = require('../models').account_model;
const uuidv1 = require('uuid/v1');//timestamp

/**
 * API to transfer amount from one account to another
 * @param  {string} username     Username of the user who initiated the request
 * @param  {string} sender     username of the sender
 * @param  {string} recipient    username of the recipient
 * @param  {float} amount    Amount to be deposited
 * @param  {int} investment_id    investment id corresponding to the sender and recipient account
 * @return {JSON} Returns success
 */
 module.exports = async function transfer_api(req, res) {

   let sender = req.body.sender
   let recipient = req.body.recipient
   let username = req.body.username
   let amount = parseFloat(req.body.amount)
   let datetime = new Date().toMysqlFormat()
   let investment_id = req.body.investment_id

   try{

     let user = await get_user_by_username(username);

     //normal users are only allowed to transfer from their own account
     //if a normal user is trying to transfer from another account
     if(user.level!=0 && username!=sender){
      throw new Error('not authorized to initiate transfer');
     }

     let isSuccesful = await transfer_amount(username,sender,recipient,amount,datetime, investment_id);
     console.log("isSuccesful",isSuccesful);
     if (!isSuccesful){ throw Error ('unable to transfer amount');}
     res.send({ code: "transfer amount successful" })


   }
   catch(err){
     console.log("error "+err);
     res.status(400).send({msg:err.message});
   }



 };

 async function transfer_amount(username,sender,recipient,amount,datetime, investment_id){

   let recipient_accnt = await get_account_by_investment(recipient,investment_id);
   let sender_accnt = await get_account_by_investment(sender, investment_id);

   let recipient_accnt_id;

    //users should exist in the database
    if(sender == recipient){
      throw new Error("Invalid request");
    }
    else if(!sender_accnt ){
      throw new Error("Invalid sender account");
    }

    if (!recipient_accnt ){

      //create a recipient account
      recipient_accnt_id = await create_user_account(recipient,investment_id);


      // throw new Error("Invalid recipient account ");
    }else{
      recipient_accnt_id = recipient_accnt.account_id;
    }


    //sender should have enough balance
    let sender_balance = await account_balance(sender_accnt.account_id);
    console.log("sender balance",sender_balance);
    console.log("Amount",amount);

    if (sender_balance < amount){
      throw new Error("Sender does not have sufficient balance");
    }

    let queries_with_val = [];
    let transaction_event_id = uuidv1();


    //debit the sender
    let debit_query_with_vals = build_insert_transaction(sender_accnt.account_id, amount, username, datetime, 'transfer', 'transfer to '+recipient, transaction_event_id,investment_id);
    //credit the recipient
    let credit_query_with_vals = build_insert_transaction(recipient_accnt_id, amount*-1, username, datetime, 'transfer', 'transfer from '+sender, transaction_event_id,investment_id);

    queries_with_val.push(debit_query_with_vals);
    queries_with_val.push(credit_query_with_vals);

    //append transaction for sender and recipient
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
