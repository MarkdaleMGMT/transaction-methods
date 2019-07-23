var db = require('../util/mysql_connection')


async function get_control_information(investment_id){

  const [rows,fields] = await db.connection.query("SELECT * FROM control WHERE investment_id = ? ",[investment_id]);
  return rows[0];
}

async function add_control_info(investment_id, rake=0, affiliate_rake=0, fx_rake=0){
  let [result,fields] = await db.connection.query("INSERT INTO control (investment_id, rake, affiliate_rake, fx_rake) VALUES (?,?,?,?)",[investment_id, rake, affiliate_rake, fx_rake])
  return result.insertId;
}

async function get_fixedrate_investments(){
  const [rows,fields] = await db.connection.query("SELECT investment_id FROM control WHERE fixed_rate_investment > 0 ");
  return rows;
}

// function build_update_clam_miner_balance(amount){
//
//   return {
//     query:"UPDATE control SET clam_miner_balance = ?",
//     queryValues:[amount]
//   }
//
// }


module.exports = {
  get_control_information,
  add_control_info,
  get_fixedrate_investments

}
