'use strict'
var db = require('../util/mysql_connection')

function build_insert_transaction(account_id, amount, created_by,time, transaction_type, memo, transaction_event_id, investment_id, exchange_rate, custom_memo=''){
  console.log("build tx custom_memo: ",custom_memo);
  return  {
    query:"INSERT INTO transaction(account_id, amount, created_by,time, transaction_type, memo, transaction_event_id, investment_id, custom_memo, exchange_rate) VALUES (?,?,?,?,?,?,?,?,?,?)",
    queryValues:[account_id, amount, created_by, time, transaction_type, memo, transaction_event_id, investment_id, custom_memo, exchange_rate]
  };

}

async function get_account_transactions(account_id){

    const [rows, fields] = await db.connection.query("SELECT * FROM transaction WHERE account_id = ? ORDER BY time ASC",[account_id]);
    return rows;

}

async function get_account_transactions_by_date(account_id, start_date, end_date){
  const [rows, fields] = await db.connection.query("SELECT * FROM transaction WHERE account_id = ? AND time >= ? and time <= ? ORDER BY time DESC ",[account_id, start_date, end_date]);
  return rows;
}

async function get_account_transactions_by_enddate (account_id,  end_date) {
  const [rows, fields] = await db.connection.query("SELECT * FROM transaction WHERE account_id = ? and time <= ? ORDER BY time DESC", [account_id, end_date])
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

async function get_trial_balance_per_investment(investment_id){


  const [rows, fields] = await db.connection.query("SELECT * FROM investment_trial_balance WHERE investment_id = ?",[investment_id]);

  if (!rows || rows.length == 0)
    return 0;

  let trial_balance = rows[0].trial_balance;
  console.log("trial_balance",typeof( parseFloat(trial_balance).toFixed(8)));
  return parseFloat(trial_balance).toFixed(8);

}

async function get_trial_balance_per_currency(currency){
  const [rows, fields] = await db.connection.query("SELECT sum(trial_balance) as 'trial_balance' FROM investment_trial_balance WHERE currency = ?",[currency]);

  if (!rows || rows.length == 0)
    return 0;

  let trial_balance = rows[0].trial_balance;
  console.log("trial_balance",typeof( parseFloat(trial_balance).toFixed(8)));
  return parseFloat(trial_balance).toFixed(8);
}

async function get_transactions_summary(investment_id){

  const [rows, fields] = await db.connection.query("SELECT account_id, sum(amount) as 'net_amount' FROM transaction  WHERE investment_id = ?  GROUP BY  account_id",[investment_id]);
  return rows;

}

async function get_transactions_with_balance(account_id){

  const [rows, fields] = await db.connection.query(
   "SET @runtot:=0, @id:=NULL; " +
   "SELECT SQL_CACHE transaction.time, transaction.transaction_id,account_id, transaction.amount, transaction.exchange_rate, " +
   "(@runtot := if(account_id=@id,@runtot,0) + amount ) AS balance, account_id=(@id:=account_id) " +
   "from transaction " +
   "WHERE transaction.account_id = ? " +
   "ORDER BY transaction.time;"
   ,[account_id]);

   return rows[1];
}

async function get_transaction_before_date(account_id, date, limit){

  const [rows, fields] = await db.connection.query("SELECT * FROM transaction WHERE time < ? and account_id = ? ORDER BY time DESC LIMIT ?;",[date, account_id, limit]);
  return rows;

}

async function new_get_account_transactions(account_id){
  let query = (
    `SET @runtot:=0;
    SELECT
      t.time,
      a.account_type as type,
      t.transaction_type,
      i.currency,
      a.username,
      t.memo as description, 
      if(a.account_type = "credit", t.amount * -1,  t.amount) as amount,
      if(a.account_type = "credit", (@runtot:=@runtot + t.amount) * - 1,
          (@runtot:=@runtot + t.amount)) AS amount_balance,
      t.exchange_rate,
      if(a.account_type = "credit", t.amount * t.exchange_rate * -1, t.amount * t.exchange_rate) as amount_cad,
      if(a.account_type = "credit", @runtot * t.exchange_rate * -1, @runtot * t.exchange_rate) as 
        amount_balance_cad,
      custom_memo
    FROM transaction t
      JOIN account a on a.account_id = t.account_id
      JOIN investment i on i.investment_id = a.investment_id
    WHERE t.account_id = ?
    ORDER BY t.time;`)

    const [rows, fields] = await db.connection.query(query, account_id)
 
    return rows[1];

} 





module.exports ={
  build_insert_transaction,
  get_account_transactions,
  get_account_transactions_by_date,
  get_transactions_per_event,
  get_trial_balance,
  get_trial_balance_per_investment,
  get_trial_balance_per_currency,
  get_transactions_summary,
  get_account_transactions_by_enddate,
  get_transactions_with_balance,
  new_get_account_transactions
}
