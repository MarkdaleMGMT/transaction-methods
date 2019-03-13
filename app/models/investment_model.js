var db = require('../util/mysql_connection')

async function get_all_investments(){

  const [investments,fields] = await db.connection.query("SELECT * FROM investment");
  return investments;
}

module.exports ={
  get_all_investments
}
