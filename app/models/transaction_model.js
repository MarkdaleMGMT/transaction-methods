'use strict'
var db = require('../util/mysql_connection')

function build_insert_transaction(username, amount, created_by,time, transaction_type, memo, transaction_event_id){

  return  {
    query:"INSERT INTO transaction(username, amount, created_by,time, transaction_type, memo, transaction_event_id) VALUES (?,?,?,?,?,?,?)",
    queryValues:[username, amount, created_by, time, transaction_type, memo, transaction_event_id ]
  };

}

async function get_user_transactions(username){

    const [rows, fields] = await db.connection.query("SELECT * FROM transaction WHERE username = ? ORDER BY time ASC",[username]);
    return rows;

}

async function get_transactions_per_event(transaction_event_id){


    const [rows, fields] = await db.connection.query("SELECT * FROM transaction WHERE transaction_event_id = ? ORDER BY time ASC",[transaction_event_id]);
    console.log("rows",rows,"fields",fields);
    return rows;

}

async function get_trial_balance(){


    const [rows, fields] = await db.connection.query("SELECT sum(amount) as 'trial_balance' FROM transaction");
    let trial_balance = rows[0].trial_balance;
    console.log("trial_balance",typeof( parseFloat(trial_balance).toFixed(8)));
    return parseFloat(trial_balance).toFixed(8);

}

async function get_transactions_summary(){

  const [rows, fields] = await db.connection.query("SELECT username, sum(amount) as 'net_amount' FROM transaction GROUP BY username");
  return rows;
}







module.exports ={
  build_insert_transaction,
  get_user_transactions,
  get_transactions_per_event,
  get_trial_balance,
  get_transactions_summary
}
