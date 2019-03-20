var db = require('../util/mysql_connection')
const { get_accounts_by_investment,account_balance  } = require('../models').account_model



/**
 * API for getting all accounts for a particular investment
 * @return {JSON}         Returns success

 */
 module.exports = async function get_accounts_api(req, res) {

   let investment_id = req.body.investment_id


   try{
     let accounts = await get_all_accounts(investment_id);
     res.send(accounts)
   }
   catch(err){
     res.status(400).send({msg: 'Unable to fetch accounts', error:err.message});
   }


 };

 async function get_all_accounts(investment_id){

   let accounts = await get_accounts_by_investment(investment_id);

   let account_details = [];

   for(i=0; i< accounts.length; i++){

     let account = accounts[i];
     let balance = account_balance(account.account_id)
     // let level = account.account_level == '0' ? 'user': account.account_level == '1' ? 'investment':'rake'
     account_details.push({
       account_id : account.account_id,
       username : account.username,
       description: account.description,
       account_type: account.account_type,
       ledger_account: account.ledger_account,
       account_level: account.level,
       balance:account_balance

     });
   }
   return account_details;
 }
