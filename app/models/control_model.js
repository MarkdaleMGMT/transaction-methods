var db = require('../util/mysql_connection')


async function get_control_information(investment_id){

  const [rows,fields] = await db.connection.query("SELECT * FROM control WHERE investment_id = ? ",[investment_id]);
  return rows[0];
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
  get_control_information

}
