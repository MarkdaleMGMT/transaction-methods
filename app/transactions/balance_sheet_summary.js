var db = require('../util/mysql_connection')
const { get_transactions_summary } = require('../models').transaction_model
const { get_user_by_username } = require('../models').user_model
const { get_all_investments, get_investment_by_id } = require('../models').investment_model
const { get_account_by_id } = require('../models').account_model




/**
 * API to get the summary of the balance sheet for all investments or a specific investment if investment_id is specified
 * @param  {int} investment_id (optional)    Amount to be deposited
 * @return {JSON}         Returns success
 */
 // TODO: add investment type
 module.exports = async function balance_sheet_summary_api(req, res) {

   try{
     let investment_id = req.body.investment_id;
     let summary = await balance_sheet_summary(investment_id);
     res.send(summary);
   }
   catch(err){
     res.status(400).send({msg: 'Unable to retrieve balance sheet summary'});
   }

 };


 async function balance_sheet_summary(investment_id){


   try{

     console.log("got investment_id ", investment_id);

     let investment_tx_summary = [];
     var investments = null;
     if(investment_id == null || investment_id == undefined){
       investments = await get_all_investments();
     }
     else{

       let single_investment = await get_investment_by_id(investment_id);
       investments = [ single_investment ]
       console.log("id",investments);
     }

     console.log("no . of investments",investments.length);

     //TODO: iterate over each investment
     for(let i=0; i<investments.length; i++){

       console.log("i ",i);

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
           amount : parseFloat(Math.abs(net_amount).toFixed(8)),
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
