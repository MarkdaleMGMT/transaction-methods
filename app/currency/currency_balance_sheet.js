var db = require('../util/mysql_connection')
const { get_trial_balance_per_currency } = require('../models').transaction_model

/**
 * API for getting the trial balance for a currency
 * @param  {string} currency
 * @return {JSON}         Returns trial balance

 */
 module.exports = async function balance_sheet_api(req, res) {

   let currency = req.body.currency


   try{
     let balance_sheet = await balance_sheet_by_currency(currency_name);
     res.send(balance_sheet)
   }
   catch(err){
     res.status(400).send({msg: 'Unable to fetch balance sheet', error:err.message});
   }



 };

 async function balance_sheet_by_currency(currency){


   try{

     let currency_tx_summary = [];

     //get all transactions in a specific currency 


     //TODO: iterate over each investment
     for(let i=0; i<investments.length; i++){

       let debit_entries = [];
       let credit_entries = [];
       let investment = investments[i];
       let currency = investment.currency;

       //TODO: for each investment extract a balance sheet summary
       let transactions_summary = await get_transactions_summary(investment.investment_id);
       console.log("transactions_summary",transactions_summary);
       for(let i=0; i<transactions_summary.length; i++){

         let net_amount = parseFloat(transactions_summary[i]['net_amount']);


         let account = await get_account_by_id(transactions_summary[i]['account_id']);
         let entry = {
           account_id:account['account_id'],
           username: account['username'],
           amount : Math.abs(net_amount),
           account_type:account['account_type'],
           ledger_account: account['ledger_account'],
           currency:currency
         };

         if(net_amount> 0){
           // console.log("debit");
           debit_entries.push(entry);

         } else if (net_amount < 0){
           // console.log("credit");
           credit_entries.push(entry);

         }//not appending entries with net balance = 0


     }

     investment_tx_summary.push({
         investment_id:investment.investment_id,
         debit:debit_entries,
         credit:credit_entries
     });



   }//end for investments

    return investment_tx_summary;


  }//end try
   catch(err){
     console.error(err);
     return false;
   }



 }
