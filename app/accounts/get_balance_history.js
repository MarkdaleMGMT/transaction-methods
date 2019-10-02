const dateFormat = require('dateformat');
const moment = require('moment');

const { get_account_transactions_by_date } = require('../models').transaction_model
const { get_account_by_id, account_balance, account_balance_by_date } = require('../models').account_model
const { get_investment_by_id } = require('../models').investment_model

// const { get_quoted_rate } = require('../foreign_exchange/quote_fx_rate')
const { get_quoted_rates_with_validity, get_valid_rate } = require('../models').fx_quoted_rates


const { getDates } = require('../util/common')
/**
 * API to fetch the balance history for a specific account over a period of time
 * @param  {int} account_id     id of the account
 * @param  {int} time_period_days  time period in days
 * @return {JSON}         Balance and Status
 */
async function balance_history_api(req, res) {


  let account_id = req.body.account_id;
  let time_period_days = req.body.time_period_days;
  let chart = req.body.chart;

  try{
    console.log("inside balance history");
    let balance_history = await get_balance_history(account_id, time_period_days, chart);
    res.send({ code: "Success", balance_history })
  }
  catch(err){
    console.error(err);
    res.status(400).send({msg: err.message});
  }



};

async function get_balance_history(account_id, time_period_days, chart=false){


  console.log("inside get_balance_history");
    //parse time period
    //find start date and end date

    let dateOffset = (24*60*60*1000) * (time_period_days -1);

    // let end_date = new Date(new Date().setHours(0,0,0,0));
    // let start_date = new Date(new Date().setHours(0,0,0,0));
    let end_date = new Date();
    let start_date = new Date();
    start_date.setTime(start_date.getTime() - dateOffset);

    //convert the date to mysql format
    // start_date = start_date.toMysqlFormat();
    // end_date = end_date.toMysqlFormat();
    start_date = dateFormat(start_date,'yyyy-mm-dd');
    //end_date = dateFormat(end_date,'yyyy-mm-dd');

    console.log("start_date ",start_date);
    console.log("end_date ",end_date);

   let account = await get_account_by_id(account_id);

   //TODO: optimize it later to perform minimal db queries
   let investment = await get_investment_by_id(account.investment_id);
   let currency = investment.currency;



   if(!account) throw new Error('Account does not exist');

   let account_type = account.account_type;

   //get the balance history between start and end date
   let transactions = await get_account_transactions_by_date(account_id, start_date, end_date);
   console.log("account history: transactions", transactions);


   let transaction_history = [];
   let balance = 0;
   // balance = last_balance = await account_balance(account_id);

   //balance = await account_balance(account_id);
   balance = await account_balance_by_date(account_id, start_date);

   console.log("last balance ", balance);

   for(let i=transactions.length-1; i>=0; i--){
     let account_transaction = transactions[i];

       if (account_type == 'debit'){
         //debits mean increase  balance
         //credits mean decrease in balance
         balance += parseFloat(account_transaction.amount);
       }
       else {
         balance -= parseFloat(account_transaction.amount);
       }

     balance = parseFloat(balance);
     console.log(i, " ", balance);

     let transaction_json = {
       'date':(account_transaction.time), //ISO string format
       'account_balance':balance,
       'currency':currency

     };


     transaction_history.push(transaction_json);


   }//end for

   console.log("Balance History" ,transaction_history);

   //We have the transaction history at this point
   // console.log("transaction_history\n",transaction_history);

   //multiply it by the exchange rate at that time period
   //get the latest exchange rate from the db src:investment currency, target: CAD

   let timestamped_quoted_rates = await get_quoted_rates_with_validity(currency, 'CAD');

   let balance_history = [];
   let dates = getDates(start_date,end_date);
   
   let account_balance = 0
   let curTranscIndex = 0
   let curTransc = null
   
   if (transaction_history && transaction_history.length != 0){ 
        curTransc = transaction_history[curTranscIndex]
	last_balance = curTransc.account_balance
    }


   for(let i=0; i<dates.length; i++){
     
    //Day starts exactly at the 0th hour, 0th minute, 0th second, 0th milisecond
    let tx_time_moment = moment(dates[i]).set({hour:0,minute:0,second:0,millisecond:0});

    //Get the valid exchange rate on this day
    let exchange_rate = get_valid_rate(timestamped_quoted_rates, tx_time_moment.format('YYYY-MM-DD'));
    exchange_rate = exchange_rate.bid;
    let balance_cad = parseFloat((exchange_rate * last_balance).toFixed(8));

    //Set the day's beginning balance
     balance_history.push({
       date:tx_time_moment.toISOString(),
       exchange_rate: exchange_rate,
       account_balance: last_balance,
       account_balance_cad: balance_cad,
       currency:currency
     });

     //Loop through the transaction on this given date
     while (transaction_history && transaction_history.length != curTranscIndex && moment(tx_time_moment).isSame(curTransc.date, "day")) {
	
	 balance_cad = parseFloat((exchange_rate * curTransc.account_balance).toFixed(8));
	 balance_history.push({
       		date:curTransc.date,
       		exchange_rate: exchange_rate,
       		account_balance: curTransc.account_balance,
       		account_balance_cad: balance_cad,
       		currency:currency
     	});

	last_balance = curTransc.account_balance
  	curTranscIndex += 1
	curTransc = transaction_history[curTranscIndex]
	
     }
   }

   //sort the dates in descending order
   /*let dates = getDates(start_date,end_date).reverse();


   // let last_balance = 0;
   //if there were no transactions in that period
   // if(transaction_history && transaction_history.length > 0){
   //
   //   last_balance = transaction_history[0].account_balance;
   // }


   for(let i=0; i<dates.length; i++){

     //entries of current date
     if(transaction_history && transaction_history.length){

       let relevant_entries = transaction_history.filter(function (el) {
         // console.log(el.date,dates[i]);
         return el.date == dates[i];
       });

       if(relevant_entries.length > 0){
         last_balance = relevant_entries[0].account_balance
       }

       //remove the found entries, assuming transaction is sorted in descending order
       transaction_history = transaction_history.splice(relevant_entries.length)
     }

     //Get the valid rate
     let tx_time_moment = moment(dates[i]).set({hour:0,minute:0,second:0,millisecond:0});
     let exchange_rate = get_valid_rate(timestamped_quoted_rates, tx_time_moment.format('YYYY-MM-DD HH:mm:ss'));
     // console.log("exchange_rate", exchange_rate);
     exchange_rate = exchange_rate.bid;
     let balance_cad = parseFloat((exchange_rate * last_balance).toFixed(8));

     balance_history.push({
       date:tx_time_moment.format('DD MM YYYY'),
       exchange_rate: exchange_rate,
       account_balance: last_balance,
       account_balance_cad: balance_cad,
       currency:currency

     });



   }*/


   return balance_history;


}

module.exports = {
  balance_history_api,
  get_balance_history
}
