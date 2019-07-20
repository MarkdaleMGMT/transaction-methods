var db = require('../util/mysql_connection');

async function log_new_rate(timestamp, from_to, source, bid, ask, quoted_bid, quoted_ask){


  // return  {
  //   query:"INSERT INTO order_book (timestamp, from_to, source, bid, ask, quoted_bid, quoted_ask) "+
  //   "VALUES (?,?,?,?,?,?,?,?)",
  //   queryValues:[timestamp, from_to, source, bid, ask, quoted_bid, quoted_ask]
  // };

console.log(timestamp, from_to, source, bid, ask, quoted_bid, quoted_ask);

  let [result,fields] = await db.connection.query(
    "INSERT INTO order_book (timestamp, from_to, source, bid, ask, quoted_bid, quoted_ask) VALUES (?,?,?,?,?,?,?)"
    ,[timestamp, from_to, source, bid, ask, quoted_bid, quoted_ask]);

  return result.insertId;

}

async function find_valid_rate(from_currency, to_currency, source){

  const [rows,fields] = await db.connection.query("SELECT * FROM order_book WHERE from_to = ? ORDER BY timestamp DESC",[from_currency+'_'+to_currency]);
  return rows[0];

}

module.exports = {
  log_new_rate,
  find_valid_rate
}
