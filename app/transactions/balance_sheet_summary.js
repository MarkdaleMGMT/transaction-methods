var db = require('../util/mysql_connection')
const { get_transactions_summary } = require('../models').transaction_model
const { get_user_by_username } = require('../models').user_model



/**
 * API to get the summary of the balance sheet
 */
 // TODO: add investment type
 module.exports = async function balance_sheet_summary_api(req, res) {

   try{
     let summary = await balance_sheet_summary();
     res.send(summary);
   }
   catch(err){
     res.status(400).send({msg: 'Unable to retrieve balance sheet summary', err});
   }

 };


 async function balance_sheet_summary(){


   try{
     let debit_entries = [];
     let credit_entries = [];

     let transactions_summary = await get_transactions_summary();
     console.log("transactions_summary",transactions_summary);
     for(let i=0; i<transactions_summary.length; i++){

       let net_amount = parseFloat(transactions_summary[i]['net_amount']);
       

       let user = await get_user_by_username(transactions_summary[i]['username']);
       let entry = {
         username: user['username'],
         amount : Math.abs(net_amount),
         account_type:user['account_type'],
         ledger_account: user['ledger_account']
       };

       if(net_amount> 0){
         // console.log("debit");
         debit_entries.push(entry);

       } else if (net_amount < 0){
         // console.log("credit");
         credit_entries.push(entry);

       }//not appending entries with net balance = 0

    }//end for
    return {
      debit:debit_entries,
      credit:credit_entries
    };
   }
   catch(err){
     console.log("got err",err);
     return false;
   }



 }
