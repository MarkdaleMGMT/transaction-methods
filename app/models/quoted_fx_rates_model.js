var db = require('../util/mysql_connection');

async function log_quoted_rate(timestamp, from_to, bid, ask){

  let midpoint = (bid + ask)/2.0;
  let [result,fields] = await db.connection.query(
    "INSERT INTO quoted_fx_rates (timestamp, from_to, bid, ask, mid) VALUES (?,?,?,?,?)"
    ,[timestamp, from_to, bid, ask, midpoint]);

  return result.insertId;

}

async function get_latest_quoted_rate(from_currency, to_currency){
  console.log("get_latest_quoted_rate from_currency ", from_currency," to_currency ", to_currency);
  const [rows,fields] = await db.connection.query("SELECT * FROM quoted_fx_rates WHERE from_to = ? OR from_to = ? ORDER BY timestamp DESC LIMIT 1",[from_currency + '_' + to_currency, to_currency + '_' + from_currency]);


  return rows[0];
}

module.exports = {
  log_quoted_rate,
  get_latest_quoted_rate
}
