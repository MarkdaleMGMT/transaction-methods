var db = require('../util/mysql_connection')

async function get_all_investments(){

  const [investments,fields] = await db.connection.query("SELECT * FROM investment");
  return investments;
}

async function get_investment_by_id(investment_id){
  const [investments,fields] = await db.connection.query("SELECT * FROM investment WHERE investment_id = ?", [investment_id]);
  return investments[0];
}

module.exports ={
  get_all_investments,
  get_investment_by_id
}
