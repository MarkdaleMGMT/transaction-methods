var db = require('../util/mysql_connection')
const { build_insert_transaction, get_transactions_per_event } = require('../models').transaction_model
const { get_user_by_username } = require('../models').user_model;
const uuidv1 = require('uuid/v1');//timestamp



/**
 * API for the deposit transaction
 * @param  {string} username     Username of the user executing the rollback transaction
 * @param  {string} transaction_event_id    of the transaction being rolled back
 * @return {JSON}         Returns success
 */
 module.exports = async function rollback_api(req, res) {

   let username = req.body.username
   let transaction_event_id = req.body.transaction_event_id
   let datetime = new Date().toMysqlFormat()

   try{
     let isSuccesful = await rollback_transaction(username,transaction_event_id,datetime);
     console.log("isSuccesful",isSuccesful);
     if (!isSuccesful){ throw Error ('unable to rollback transaction');}
     res.send({ code: "Transaction rollback successful" })
   }
   catch(err){
     res.status(400).send({msg: 'Transaction rollback failed', err});
   }



 };


 async function rollback_transaction(username,transaction_event_id,datetime){


   try{


     let user = await get_user_by_username(username);
     let rollback_tx_event_id = uuidv1();

     //check if the user is admin, if not throw an error
     if(user.level!=0 && username!=sender){
      throw new Error('not authorized to initiate transfer');
     }

     //fetch transactions by transaction_event_id
     let event_transactions = await get_transactions_per_event(transaction_event_id);
     let queries_with_val = [];

     for(let i = 0; i < event_transactions.length; i++){

       //reverse debit to credit
       //transaction_type = rollback
       //memo = rollback of transaction <transaction_event_id>
       //assign rollback to a new transaction event

       let tx = event_transactions[i];
       let adjustment_query = build_insert_transaction(tx.username, tx.amount*-1, user.username,datetime, 'rollback', 'rollback of transaction' + transaction_event_id, rollback_tx_event_id);
       queries_with_val.push(adjustment_query);
     }


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
   catch(err){
     console.log("got err",err);
     throw err;
   }



 }
