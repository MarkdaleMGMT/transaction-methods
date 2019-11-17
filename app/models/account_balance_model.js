var db = require('../util/mysql_connection');

function build_insert_balance(time, account_id, investment_id, amount, balance, exchange_rate, transaction_event_id){

  // balance = parseFloat ( (balance);
  let amount_cad = parseFloat( (amount * exchange_rate).toFixed(8) );
  let balance_cad = parseFloat( (balance * exchange_rate).toFixed(8) );

  time, account_id, investment_id, amount, balance, exchange_rate, transaction_event_id

  return  {
    query:"INSERT INTO account_balance(timestamp, account_id, investment_id, amount, exchange_rate, transaction_event_id, amount_cad, balance, balance_cad) VALUES (?,?,?,?,?,?,?,?,?)",
    queryValues:[time, account_id, investment_id, amount, exchange_rate, transaction_event_id, amount_cad, balance, balance_cad]
  };

}


module.exports ={
  build_insert_balance
}
