var db = require('../util/mysql_connection')
// const { get_user_by_username } = require('../models').user_model
const { account_balance, get_accounts_per_user } = require('../models').account_model
const {  get_investment_by_id } = require('../models').investment_model
const { get_quoted_rate } = require('../foreign_exchange/get_rate')


/**
 * API to fetch the balance for a specific user or a specific account , depending on which parameter is provided
 * @param  {string} key     "username" or "account_id"
 * @param  {string} value value corresponding to the key
 * @return {JSON}         Balance and Status
 */
 module.exports = async function get_user_balance_api(req, res) {

   let key  = req.body.key
   let value = req.body.value

   try{

     if (key=='username'){
        let user_balance = await get_user_balance(value);
        res.send({ code: "Success", user_balance })
      }else{
        let account_balance = await get_account_balance(parseInt(value));
        res.send({ code: "Success", account_balance })
      }
   }
   catch(err){
     res.status(400).send({msg: 'Unable to fetch balance', err});
   }



 };

 async function get_account_balance(account_id){


   try{
     return await account_balance(account_id);

   }
   catch(err){
     console.error(err);
     throw err;
   }



 }


 async function get_user_balance(username){


   try{

     let user_balance = []

     let user_accounts = await get_accounts_per_user(username)
     for(let i=0; i < user_accounts.length; i++){
       var account = user_accounts[i];

       //TODO: optimize it later to perform minimal db queries
       var investment = await get_investment_by_id(account.investment_id);
       var currency = investment.currency;

       //get the latest exchange rate from the db src:investment currency, target: CAD
       let quoted_rate = await get_quoted_rate(currency, 'CAD');
       let exchange_rate = parseFloat(quoted_rate.bid);

       var balance = await account_balance(account.account_id);
       let balance_cad = parseFloat((exchange_rate * balance).toFixed(8));

       user_balance.push({
         'account_id':account.account_id,
         'investment_id':account.investment_id,
         'investment_name':investment.investment_name,
         'balance':balance,
         'balance_cad':balance_cad,
         'currency':currency

       })
     }

     return user_balance
   }
   catch(err){
     console.error(err);
     throw err;
   }



 }
