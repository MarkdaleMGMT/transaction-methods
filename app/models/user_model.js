var db = require('../util/mysql_connection');

function build_update_user_balance(username,new_balance){

  return {
    query:"UPDATE user SET clam_balance = ? WHERE username = ?;",
    queryValues:[new_balance, username]
  }

}

function calculate_new_user_balance(original_clam_balance,prev_user_balance,change_in_clam_balance, rake_share){

  // console.log("calculate_new_user_balance\n",typeof(original_clam_balance),typeof(prev_user_balance),typeof(change_in_clam_balance), typeof(rake_share));
  let user_share = prev_user_balance/original_clam_balance;
  let new_balance = prev_user_balance + (1 - rake_share)*(change_in_clam_balance * user_share);

  console.log("prev_user_balance",prev_user_balance);
  // console.log("change_in_clam_balance * user_share",change_in_clam_balance * user_share);
  console.log("(1 - rake_share)*(change_in_clam_balance * user_share)",(1 - rake_share)*(change_in_clam_balance * user_share));
  // console.log("user_share",user_share);
  console.log("new_balance",new_balance);

  return new_balance;

}

async function get_all_users(){

  const [users, fields] = await db.connection.query("SELECT * FROM user");
  return users;
}

async function get_user_by_username(username){

  const [rows, fields] = await db.connection.query("SELECT * FROM user WHERE username = ?",[username]);
  return rows[0];
}

module.exports = {
  build_update_user_balance,
  calculate_new_user_balance,
  get_user_by_username,
  get_all_users
};
