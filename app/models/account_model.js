var db = require('../util/mysql_connection');
const { get_account_transactions } = require('./transaction_model')



async function get_account_by_id(account_id){

  const [rows, fields] = await db.connection.query("SELECT * FROM account WHERE account_id = ?",[account_id]);
  return rows[0];
}

async function get_account_by_investment(username,investment_id){
  const [rows, fields] = await db.connection.query("SELECT * FROM account WHERE username = ? AND investment_id = ?",[username,investment_id]);
  return rows[0];
}

async function get_accounts_by_investment(investment_id){
  const [rows, fields] = await db.connection.query("SELECT * FROM account WHERE investment_id = ?",[investment_id]);
  return rows;
}

async function get_investment_account(investment_id){

  const [rows, fields] = await db.connection.query("SELECT * FROM account WHERE investment_id = ? and account_level = ?",[investment_id,1]);
  return rows[0];
}

async function get_rake_account(investment_id){

  const [rows, fields] = await db.connection.query("SELECT * FROM account WHERE investment_id = ? and account_level = ?",[investment_id,2]);
  return rows[0];
}

async function get_accounts_per_user(username){
  const [accounts, fields] = await db.connection.query("SELECT * FROM account WHERE username = ?",[username]);
  return accounts;
}

async function account_balance(account_id){

  //TODO: Create a view that returns the account balance
  let account = await get_account_by_id(account_id);
  if(!account) throw new Error('Account does not exist');

  let account_type = account.account_type;


  let transactions = await get_account_transactions(account_id);

  let total_credits = 0;
  let total_debits = 0;

  for(let i=0; i<transactions.length; i++){


    let account_transaction = transactions[i];
    let amount = parseFloat(account_transaction.amount);

    // console.log("amount ",amount);

    if(amount < 0){
       total_credits += (amount * -1.0);
    }else{
      total_debits += amount;
    }

  }//end for

  let account_balance = 0;
  if (account_type == 'debit'){
    account_balance = total_debits - total_credits;
  }
  else {
    account_balance = total_credits - total_debits;
  }
  // console.log("total_credits ",total_credits);
  // console.log("total_debits ",total_debits);

  return parseFloat(account_balance.toFixed(8));
}

/*function calculate_balances(original_clam_balance,prev_user_balance,change_in_clam_balance, rake_share){

  // console.log("original_clam_balance,prev_user_balance,change_in_clam_balance, rake_share");
  // console.log(original_clam_balance,prev_user_balance,change_in_clam_balance, rake_share);
  // console.log("calculate_new_user_balance\n",typeof(original_clam_balance),typeof(prev_user_balance),typeof(change_in_clam_balance), typeof(rake_share));
  let user_share = prev_user_balance*1.0/original_clam_balance;
  let new_balance = prev_user_balance + (1 - rake_share)*(change_in_clam_balance * user_share);
  let rake_balance = (rake_share)*(change_in_clam_balance * user_share);

  // console.log("prev_user_balance",prev_user_balance);
  console.log("user_share",user_share);
  // // console.log("change_in_clam_balance * user_share",change_in_clam_balance * user_share);
  // console.log("(1 - rake_share)*(change_in_clam_balance * user_share)",(1 - rake_share)*(change_in_clam_balance * user_share));
  // // console.log("user_share",user_share);
  // console.log("new_balance",new_balance);

  return {
    "new_user_balance":new_balance,
    "rake_balance":rake_balance
  };

}


async function get_balance(username){
  let user = await get_user_by_username(username);
  if(!user) throw new Error('User does not exist');

  let account_type = user.account_type;


  let transactions = await get_user_transactions(username);

  let total_credits = 0;
  let total_debits = 0;

  for(let i=0; i<transactions.length; i++){


    let user_transaction = transactions[i];
    let amount = parseFloat(user_transaction.amount);

    // console.log("amount ",amount);

    if(amount < 0){
       total_credits += (amount * -1.0);
    }else{
      total_debits += amount;
    }

  }//end for

  let user_balance = 0;
  if (account_type == 'debit'){
    user_balance = total_debits - total_credits;
  }
  else {
    user_balance = total_credits - total_debits;
  }
  // console.log("total_credits ",total_credits);
  // console.log("total_debits ",total_debits);

  return parseFloat(user_balance.toFixed(8));
}*/
async function create_user_account(username,investment_id){


  let new_accnt_id = await create_account(username,investment_id,'user account','credit','liability',0);
  console.log("newly created account ", new_accnt_id);
  return new_accnt_id;


}

async function create_investment_account(investment_id){


  let new_accnt_id = await create_account(process.env.INVESTMENT_ACNT,investment_id,'investment account','debit','asset',1);
  console.log("newly created account ", new_accnt_id);
  return new_accnt_id;


}

async function create_rake_account(investment_id){


  let new_accnt_id = await create_account(process.env.RAKE_ACNT,investment_id,'rake account','credit','liability',2);
  console.log("newly created account ", new_accnt_id);
  return new_accnt_id;


}

async function create_account(username,investment_id,description,account_type,ledger_account,account_level){

  let [result,fields] = await db.connection.query("INSERT INTO account (username, investment_id, description, account_type, ledger_account, account_level) VALUES (?,?,?,?,?,?)",[username, investment_id, description, account_type, ledger_account, account_level])
  return result.insertId;

}

async function get_all_accounts(investment_id){

  const [accounts, fields] = await db.connection.query("SELECT * FROM account WHERE investment_id = ? AND account_level!= 1",[investment_id]);
  return accounts;
}

function calculate_balances(original_balance,prev_accnt_balance,change_in_balance, rake_share){

  // console.log("original_clam_balance,prev_user_balance,change_in_clam_balance, rake_share");
  // console.log(original_clam_balance,prev_user_balance,change_in_clam_balance, rake_share);
  // console.log("calculate_new_user_balance\n",typeof(original_clam_balance),typeof(prev_user_balance),typeof(change_in_clam_balance), typeof(rake_share));
  let accnt_share = prev_accnt_balance*1.0/original_balance;
  let new_balance = prev_accnt_balance + (1 - rake_share)*(change_in_balance * accnt_share);
  let rake_balance = (rake_share)*(change_in_balance * accnt_share);

  // console.log("prev_user_balance",prev_user_balance);
  console.log("accnt_share",accnt_share);
  // // console.log("change_in_clam_balance * user_share",change_in_clam_balance * user_share);
  // console.log("(1 - rake_share)*(change_in_clam_balance * user_share)",(1 - rake_share)*(change_in_clam_balance * user_share));
  // // console.log("user_share",user_share);
  // console.log("new_balance",new_balance);

  return {
    "new_accnt_balance":new_balance,
    "rake_balance":rake_balance
  };

}


module.exports = {
  get_account_by_id,
  get_account_by_investment,
  get_accounts_by_investment,
  get_investment_account,
  get_rake_account,
  account_balance,
  get_accounts_per_user,
  get_all_accounts,
  calculate_balances,
  create_user_account,
  create_investment_account,
  create_rake_account
};
