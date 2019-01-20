var db = require('../util/mysql_connection');
var md5 = require('md5')
function build_update_user_balance(username,new_balance){

  return {
    query:"UPDATE user SET clam_balance = ? WHERE username = ?;",
    queryValues:[new_balance, username]
  }

}

function calculate_new_user_balance(original_clam_balance,prev_user_balance,change_in_clam_balance, rake_share){

  console.log("original_clam_balance,prev_user_balance,change_in_clam_balance, rake_share");
  console.log(original_clam_balance,prev_user_balance,change_in_clam_balance, rake_share);
  // console.log("calculate_new_user_balance\n",typeof(original_clam_balance),typeof(prev_user_balance),typeof(change_in_clam_balance), typeof(rake_share));
  let user_share = prev_user_balance*1.0/original_clam_balance;
  let new_balance = prev_user_balance + (1 - rake_share)*(change_in_clam_balance * user_share);

  console.log("prev_user_balance",prev_user_balance);
  console.log("user_share",user_share);
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

async function create_user(body){
  console.log("new user body", body)
  let username = body.username
  let password = body.password
  let email = body.email
  let hashedPassword = password
  let verify_key = md5(username).slice(-5)
  let query = "INSERT INTO `user` (`username`, `password`, `level`, `clam_balance`, `last_login`, `email`, `email_verify_key`, `email_verify_flag`, `account_type`, `ledger_account`, `sub_account1`, `sub_account2`) VALUES (?, ?, 1, 0, CURRENT_TIMESTAMP, ?, ?, '0', '', '', NULL, NULL);"
  let result = db.connection.query(query, [username, hashedPassword, email, verify_key])
  console.log("signup", username)
  return verify_key
}

async function get_user_by_username(username){
  const [rows, fields] = await db.connection.query("SELECT * FROM user WHERE username = ?",[username]);
  return rows[0];
}
async function add_referral(user, affiliate){
  console.log("add reffff")
  let query = "UPDATE user SET affiliate = ? WHERE username = ?;"
  let result = db.connection.query(query, [affiliate, user])
  console.log(result)
  return result
}
async function confirm_email(key){
  let query = "UPDATE user SET email_verify_flag = 1 WHERE email_verify_key = ?;"
  let result = await db.connection.query(query, [key])
  console.log(result)
  return result
}
module.exports = {
  build_update_user_balance,
  calculate_new_user_balance,
  get_user_by_username,
  get_all_users,
  create_user,
  add_referral,
  confirm_email
};
