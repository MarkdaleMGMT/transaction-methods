'use strict'
var db = require('../util/mysql_connection')

function build_insert_transaction(username, amount, created_by,time, transaction_type, memo){

  return  {
    query:"INSERT INTO transaction(username, amount, created_by,time, transaction_type, memo) VALUES (?,?,?,?,?,?)",
    queryValues:[username, amount, created_by, time, transaction_type, memo ]
  };

}

async function get_user_transactions(username){

    const [rows, fields] = await db.connection.query("SELECT * FROM transaction WHERE username = ? ORDER BY time ASC",[username]);
    return rows;

}





module.exports ={
  build_insert_transaction,
  get_user_transactions
}
