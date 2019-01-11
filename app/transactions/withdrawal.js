var db = require('../util/mysql_connection')
const { build_insert_transaction } = require('../models').transaction_model
const {build_update_user_balance, get_user_by_username} = require('../models').user_model

/**
 * API for withdrawal transaction
 * @param  {string} username     Username of the user doing the transaction
 * @param  {float} amount    Amount to be withdrawed
 * @return {JSON}         Returns success
 */

 module.exports = async function withdrawal_api(req, res) {

   let username = req.body.username
   let amount = req.body.amount
   let datetime = new Date().toMysqlFormat()

   try{
     let isSuccesful = await withdraw(username,amount,datetime);
     if (!isSuccesful){ throw Error ('unable to withdraw amount');}
     res.send({ code: "Withdrawal successful" })
   }
   catch(err){
     res.status(400).send({msg: 'Withdrawal failed', err});
   }




 };


 async function withdraw(username,amount,datetime){



    try{

      console.log("withdrawal transaction  ",username," ",amount," ",datetime);

       let queries_with_val = []

       let debit_query_with_vals = build_insert_transaction(username, amount, 'admin', datetime, 'withdrawal', 'withdrawal');
       let credit_query_with_vals = build_insert_transaction('clam_mine', amount*-1, 'admin', datetime, 'withdrawal', 'withdrawal');

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
      let previous_balance = await get_user_by_username(username)
      console.log("previous balance", previous_balance)
     let new_amount = parseFloat(previous_balance.clam_balance) - parseFloat(amount)
     console.log("new amount", new_amount)
     let update_query =  build_update_user_balance(username, new_amount)
     let current_balance = await db.connection.query(update_query.query, update_query.queryValues)
     console.log("update query",update_query)
     console.log("curr balance", current_balance)
      return rows_affected == queries_with_val.length;
    }
    catch(err){
      console.log("got err",err);
      return false;
    }



 }
