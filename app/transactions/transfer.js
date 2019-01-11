var db = require('../util/mysql_connection')
const { build_insert_transaction } = require('../models').transaction_model;
const { get_balance, get_user_by_username } = require('../models').user_model;

/**
 * API to transfer amount from one account to another
 * @param  {string} username     Username of the user who initiated the request
 * @param  {string} sender     Username of the sender
 * @param  {string} recipient     Username of the recipient
 * @param  {float} amount    Amount to be deposited
 * @return {JSON} Returns success
 */
 module.exports = async function transfer_api(req, res) {

   let sender = req.body.sender
   let recipient = req.body.recipient
   let username = req.body.username
   let amount = parseFloat(req.body.amount)
   let datetime = new Date().toMysqlFormat()

   try{

     let user = await get_user_by_username(username);

     //normal users are only allowed to transfer from their own account
     //if a normal user is trying to transfer from another account
     if(user.level!=0 && username!=sender){
      throw new Error('not authorized to initiate transfer');
     }

     let isSuccesful = await transfer_amount(sender,recipient,amount,datetime);
     console.log("isSuccesful",isSuccesful);
     if (!isSuccesful){ throw Error ('unable to transfer amount');}
     res.send({ code: "transfer amount successful" })


   }
   catch(err){
     console.log("error "+err);
     res.status(400).send({msg:err.message});
   }



 };

 async function transfer_amount(sender,recipient,amount,datetime){



    //users should exist in the database
    if(sender == recipient){
      throw new Error("Invalid request");
    }
    else if (await get_user_by_username(recipient)==null){
      throw new Error("Recipient does not exist ");
    }else if(await get_user_by_username(sender)==null){
      throw new Error("Sender does not exist ");
    }

    //sender should have enough balance
    let sender_balance = await get_balance(sender);
    console.log("sender balance",sender_balance);
    console.log("Amount",amount);

    if (sender_balance < amount){
      throw new Error("Sender does not have sufficient balance");
    }

    let queries_with_val = [];


    //debit the sender
    let debit_query_with_vals = build_insert_transaction(sender, amount, 'admin', datetime, 'transfer', 'transfer to '+recipient);
    //credit the recipient
    let credit_query_with_vals = build_insert_transaction(recipient, amount*-1, 'admin', datetime, 'transfer', 'transfer from '+sender);

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
