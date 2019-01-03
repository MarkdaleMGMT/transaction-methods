var db = require('../util/mysql_connection')

var { control_model, user_model, transaction_model } = require('../models')

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


     const control_data = await control_model.get_control_information();
     let  original = parseFloat(control_data.clam_miner_balance);
     let  rake_share = parseFloat(control_data.clam_miner_rake);

     let change = amount - original // change in clam_miner_balance
     if( change == 0 ) return false;
     console.log("original ",original,"amount ",amount,"\nchange ",change);


     const users = await user_model.get_all_users();



     //list of queries executed within a single transaction
     let transaction_queries = []

     let debit_clam_miner = transaction_model.build_insert_transaction('clam_miner','debit', change, 'admin', datetime, 'update_clam_miner', 'update_clam_miner');
     let update_clam_miner_balance = control_model.build_update_clam_miner_balance(amount);

     transaction_queries.push(debit_clam_miner);
     transaction_queries.push(update_clam_miner_balance);

     sum += change;


     for (let i=0; i< users.length; i++){

       let user = users[i];
       let username = user.username;


       let prev_user_balance = parseFloat(user.clam_balance);
       let new_user_balance = user_model.calculate_new_user_balance(original, prev_user_balance, change, rake_share);
       let user_balance_change = (new_user_balance - prev_user_balance);

       console.log("new_user_balance",new_user_balance);
       console.log("user_balance_change",user_balance_change);

       let update_user_balance = user_model.build_update_user_balance(username, new_user_balance);
       transaction_queries.push(update_user_balance);

       let credit_user = transaction_model.build_insert_transaction(username, 'credit', user_balance_change*-1, 'admin', datetime, 'update_clam_miner', 'update_clam_miner');
       transaction_queries.push(credit_user);

       sum -= user_balance_change;
       console.log("user_balance_change ",user_balance_change);



     }



     let rake_amount = (rake_share * change);
     let rake_user = await user_model.get_user_by_username('rake_user');
     let new_rake_user_balance =parseFloat(rake_user.clam_balance) + rake_amount;

     let update_rake_user_balance = user_model.build_update_user_balance('rake_user', new_rake_user_balance);
     transaction_queries.push(update_rake_user_balance);


     let credit_rake_user = transaction_model.build_insert_transaction('rake_user','credit', rake_amount*-1, 'admin', datetime, 'update_clam_miner', 'update_clam_miner');
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
