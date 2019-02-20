var db = require('../util/mysql_connection')
const { get_trial_balance } = require('../models').transaction_model


/**
 * API for fetching the trial balance
 */
 module.exports = async function trial_balance_api(req, res) {



   try{
     // TODO: add investment tyoe as input paramter in the future
     let result = await fetch_trial_balance();
     res.send(result)
   }
   catch(err){
     res.status(400).send({msg: 'Unable to fetch trial balance', err});
   }



 };


 async function fetch_trial_balance(){


   try{

     let trial_balance = await get_trial_balance();
     let result = {
       trial_balance:trial_balance,
       state:trial_balance!=0?"unbalanced ledger":"balanced"
     }
     return result;

   }
   catch(err){
     console.log("got err",err);
     throw err;
   }



 }
