var db = require('../util/mysql_connection')

var { control_model, user_model, transaction_model } = require('../models')
const uuidv1 = require('uuid/v1');//timestamp

// var control_model = require('../mo/control_model')
// var user_model = require('./user_model')
// var transaction_model = require('../transactions/transaction_model')
// const { build_insert_transaction } = require('../transaction_model')

/**
 * API for updating global clam_balance
 * @param  {float} amount     New amount of the global clam_miner_balance
 * @return {JSON}         Returns success
 */

 module.exports = async function update_balance_api(req, res) {

   let amount = req.body.amount
   let datetime = new Date().toMysqlFormat()

   try{
     let isSuccesful = await update_clam_balance(amount,datetime);
     if (!isSuccesful){ throw Error ('unable to update balance');}
     res.send({ code: "balance updated" })
   }
   catch(err){
     res.status(400).send({msg: 'Unable to update balance', err});
   }


 };


 async function update_clam_balance(amount,datetime){
   try{
     //get the clam miner balance and clam miner rake from control table
     let sum = 0;
     let transaction_event_id = uuidv1(); // ⇨ '3b99e3e0-7598-11e8-90be-95472fb3ecbd'


     const control_data = await control_model.get_control_information();
     let  original = await user_model.get_balance('clam_miner');
     let  rake_share = parseFloat(control_data.clam_miner_rake);

     let change = amount - original // change in clam_miner_balance
     if( change == 0 ) return false;
     console.log("original ",original,"amount ",amount,"\nchange ",change);


     const users = await user_model.get_all_users();



     //list of queries executed within a single transaction
     let transaction_queries = []

     let debit_clam_miner = transaction_model.build_insert_transaction('clam_miner', change, 'admin', datetime, 'update_clam_miner', 'update_clam_miner',transaction_event_id);


     transaction_queries.push(debit_clam_miner);


     sum += change;

     let rake_user_balance = 0;


     for (let i=0; i< users.length; i++){

       let user = users[i];
       let username = user.username;


       let prev_user_balance = await user_model.get_balance(username);
       let new_user_balance = user_model.calculate_new_user_balance(original, prev_user_balance, change, rake_share);
       let user_balance_change = (new_user_balance - prev_user_balance);

       console.log("new_user_balance",new_user_balance);
       console.log("user_balance_change",user_balance_change);


       let credit_user = transaction_model.build_insert_transaction(username, user_balance_change*-1, 'admin', datetime, 'update_clam_miner', 'update_clam_miner',transaction_event_id);
       transaction_queries.push(credit_user);

       sum -= user_balance_change;
       console.log("user_balance_change ",user_balance_change);



     }



     let rake_amount = (rake_share * change);
     let credit_rake_user = transaction_model.build_insert_transaction('rake_user', rake_amount*-1, 'admin', datetime, 'update_clam_miner', 'update_clam_miner', transaction_event_id);
     transaction_queries.push(credit_rake_user);

     sum -= rake_amount;
     console.log("rake_amount ",rake_amount);

     let results = await db.connection.begin_transaction(transaction_queries);


     // console.log("got results",results[0]);
     let rows_affected = 0;
     for(let x=0; x < results.length; x++){
       console.log("results[x]",results[x][0].affectedRows);
       rows_affected+= results[x][0].affectedRows;
     }

     console.log("rows affected",rows_affected);
     console.log("SUM",sum);

     return rows_affected == transaction_queries.length;

   }
   catch (err){
     console.log("got err",err);
     return false;
   }
 }
