var db = require('../util/mysql_connection')
const { get_trial_balance, get_trial_balance_per_investment } = require('../models').transaction_model


/**
 * API for fetching the trial balance for a particular investment if investment id  is provided
 Otherwise, returns the overall trial balance
 * @param  {int} investment_id   (optional)
 * @return {JSON}         Returns success containing the trial balance for specific investment
 */
 module.exports = async function trial_balance_api(req, res) {

   let investment_id = req.body.investment_id

   try{

     let result = await fetch_trial_balance(investment_id);
     res.send(result)
   }
   catch(err){
     res.status(400).send({msg: 'Unable to fetch trial balance'});
   }



 };


 async function fetch_trial_balance(investment_id){


   try{

     let trial_balance = null;

     if (!investment_id)
     {
       trial_balance = await get_trial_balance();
     }else{
       trial_balance = await get_trial_balance_per_investment(investment_id);
     }
     let result = {
       trial_balance:trial_balance,
       state:trial_balance!=0?"unbalanced ledger":"balanced"
     }
     return result;

   }
   catch(err){
     console.error("got err",err.message);
     throw err;
   }



 }
