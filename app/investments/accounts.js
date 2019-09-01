var db = require('../util/mysql_connection')
const { get_accounts_by_investment,account_balance  } = require('../models').account_model
const { get_investment_by_id  } = require('../models').investment_model
const { get_quoted_rate } = require('../foreign_exchange/quote_fx_rate')



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

   let investment = await get_investment_by_id(investment_id);
   let accounts = await get_accounts_by_investment(investment_id);

   //get the latest exchange rate from the db src:investment currency, target: CAD
   let quoted_rate = await get_quoted_rate(investment.currency, 'CAD');
   let exchange_rate = parseFloat(quoted_rate.bid);
   console.log(investment.currency, '/CAD: ',exchange_rate);

   let account_details = [];

   for(i=0; i< accounts.length; i++){

     let account = accounts[i];
     let balance = await account_balance(account.account_id);
     let balance_cad = parseFloat((exchange_rate * balance).toFixed(8));
     console.log("balance for account id ",account.account_id, " : ",balance);
     // let level = account.account_level == '0' ? 'user': account.account_level == '1' ? 'investment':'rake'
     account_details.push({
       account_id : account.account_id,
       username : account.username,
       description: account.description,
       account_type: account.account_type,
       ledger_account: account.ledger_account,
       account_level: account.level,
       balance:balance,
       balanced_cad: balance_cad,
       currency:investment.currency,


     });
   }
   return account_details;
 }
