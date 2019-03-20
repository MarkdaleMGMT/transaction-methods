var db = require('../util/mysql_connection')
const { get_trial_balance_per_currency } = require('../models').transaction_model

/**
 * API for getting the trial balance for a currency
 * @param  {string} currency
 * @return {JSON}         Returns trial balance

 */
 module.exports = async function trial_balance_api(req, res) {

   let currency = req.body.currency


   try{
     let trial_balance = await trial_balance_by_currency(currency);
     res.send(trial_balance)
   }
   catch(err){
     res.status(400).send({msg: 'Unable to fetch trial balance', error:err.message});
   }



 };

 async function trial_balance_by_currency(currency){


   try{
     //TODO: check if valid currency

     let trial_balance = null;
     trial_balance = await get_trial_balance_per_currency(currency);

     if(trial_balance == undefined || trial_balance == null || isNan(trial_balance)){
       throw new Error("Unable to fetch trial balance")
     }

     let result = {
       trial_balance:trial_balance,
       state:trial_balance!=0?"unbalanced ledger":"balanced",
       currency: currency
     }
     return result;

   }
   catch(err){
     console.error("got err",err.message);
     throw err;
   }



 }
