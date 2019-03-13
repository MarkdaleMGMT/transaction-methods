var db = require('../util/mysql_connection')

async function get_all_investments(){

  const [rows,fields] = await db.connection.query("SELECT * FROM investment");
  return rows[0];
}

module.exports ={
  get_all_investments
}
