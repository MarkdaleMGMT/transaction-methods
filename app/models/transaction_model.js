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

    console.log("31528960-1ed9-11e9-858a-c5c3491c85e0");
    const [rows, fields] = await db.connection.query("SELECT * FROM transaction WHERE transaction_event_id = ? ORDER BY time ASC",[transaction_event_id]);
    console.log("rows",rows,"fields",fields);
    return rows;

}






module.exports ={
  build_insert_transaction,
  get_user_transactions,
  get_transactions_per_event
}
