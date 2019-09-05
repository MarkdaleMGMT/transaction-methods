var db = require('../util/mysql_connection')

async function get_all_investments(){

  const [investments,fields] = await db.connection.query("SELECT * FROM investment");
  return investments;
}

async function get_investment_by_id(investment_id){
  const [investments,fields] = await db.connection.query("SELECT * FROM investment WHERE investment_id = ?", [investment_id]);
  return investments[0];
}

async function get_investment_by_name(investment_name){
  const [investments,fields] = await db.connection.query("SELECT * FROM investment WHERE investment_name = ?", [investment_name]);
  return investments[0];
}

async function create_investment(investment_name, description, currency, username){
  let [result,fields] = await db.connection.query("INSERT INTO investment (investment_name, description, currency, created_by) VALUES (?,?,?,?)",[investment_name, description, currency, username])
  return result.insertId;
}

async function get_all_currencies(){
  let [currencies, fields] = await db.connection.query("SELECT DISTINCT(currency) FROM investment");
  return currencies.map(currencyObj => { return currencyObj.currency});
}

module.exports ={
  get_all_investments,
  get_investment_by_id,
  get_investment_by_name,
  create_investment,
  get_all_currencies
}
