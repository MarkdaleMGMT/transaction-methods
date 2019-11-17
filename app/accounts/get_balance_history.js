const dateFormat = require('dateformat');
const moment = require('moment');

const { get_transactions_with_balance  } = require('../models').transaction_model
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
    let account = await get_account_by_id(account_id)
    let balance_history = await get_balance_history(account, time_period_days, chart);
    res.send({ code: "Success", "balance_history": balance_history })
  }
  catch(err){
    console.error(err);
    res.status(400).send({msg: err.message});
  }



};

//TODO: update the above API to pass the user acount
async function get_balance_history(account, time_period_days, chart=false, investment){


  console.log("inside get_balance_history account_id: ", account.account_id);
    //parse time period
    //find start date and end date
    let start_time = new Date();
    let end_time = new Date();
    let interm_time = start_time;
    let dateOffset = (24*60*60*1000) * (time_period_days -1);

    // let end_date = new Date(new Date().setHours(0,0,0,0));
    // let start_date = new Date(new Date().setHours(0,0,0,0));
    let end_date = new Date();
    let start_date = new Date();
    start_date.setTime(start_date.getTime() - dateOffset);

    //convert the date to mysql format
    // start_date = start_date.toMysqlFormat();
    // end_date = end_date.toMysqlFormat();
    // start_date = dateFormat(start_date,'yyyy-mm-dd');
    let start_date_moment = moment(start_date);
    //end_date = dateFormat(end_date,'yyyy-mm-dd');

    console.log("start_date ",start_date);
    console.log("end_date ",end_date);

   // let account = await get_account_by_id(account_id);

   //TODO: optimize it later to perform minimal db queries
   if(!investment) investment = await get_investment_by_id(account.investment_id);
   let currency = investment.currency;
   if(!account) throw new Error('Account does not exist');

   end_time = new Date()
   console.log("");
   console.info('time to fetch investments: %dms', end_time - interm_time)
   interm_time = end_time

   let transactions = await get_transactions_with_balance(account.account_id);
   console.log("transactions len: ", transactions.length)

   end_time = new Date()
   console.log("");
   console.info('time to fetch tc: %dms', end_time - interm_time)
   interm_time = end_time

   //Filter the dates out
   //Use binary search since dates are sorted to get the index of the start date
   let left_idx = 0, right_idx = transactions.length -1;
   while (left_idx < right_idx){

     let mid_idx = Math.floor((left_idx + right_idx)/2);
     if (start_date_moment.isAfter(transactions[mid_idx].time)){
        left_idx = mid_idx + 1
     }else{
        right_idx = mid_idx;
     }

   }

   let filtered_transactions = transactions.slice(left_idx);
   console.log("filtered_transactions len: ", filtered_transactions.length)
   // console.log("filtered_transactions", filtered_transactions );

   let transaction_history = filtered_transactions.map(tx => {

     // let exchange_rate = get_valid_rate(timestamped_quoted_rates, moment(tx.time).format('YYYY-MM-DD'));
     let balance_cad = parseFloat((tx.exchange_rate * tx.balance).toFixed(8));

     // console.log("tx", tx)
     return {
       'date':tx.time, //ISO string format
       'currency':currency,
       'exchange_rate': parseFloat(tx.exchange_rate),
       'amount': account.account_type == 'credit' ? tx.amount*-1.0 : tx.amount,
       'account_balance':account.account_type == 'credit' ? tx.balance*-1.0 : tx.balance,
       'account_balance_cad': account.account_type == 'credit' ? balance_cad*-1.0 : balance_cad

     }
   });

   end_time = new Date()
   console.log("");
   console.info('time to filter tc: %dms', end_time - interm_time)
   interm_time = end_time

   console.log("Balance history ", transaction_history.length);


   //We have the transaction history at this point
   // console.log("transaction_history\n",transaction_history);

   //multiply it by the exchange rate at that time period
   //get the latest exchange rate from the db src:investment currency, target: CAD

   //let timestamped_quoted_rates = await get_quoted_rates_with_validity(currency, 'CAD');

   let balance_history = [];
   let dates = getDates(start_date,end_date);
   console.log("Dates: ", dates[0]);

   //starting balance is carried from last transaction
   // let last_tx = (await get_transaction_before_date(account.account_id, start_date, 1))[0]
   // let curTranscIndex = 0;
   let account_balance = 0
   let curTranscIndex = 0
   let curTransc = null
   let exchange_rate = 1

   //set the last balance to the first transactions balance
   if (transaction_history && transaction_history.length != 0){
        curTransc = transaction_history[curTranscIndex]
        // console.log(transaction_history[curTranscIndex])
	      last_balance = curTransc.account_balance
        exchange_rate = curTransc.exchange_rate
    }


   for(let i=0; i<dates.length; i++){

    //Day starts exactly at the 0th hour, 0th minute, 0th second, 0th milisecond
    let tx_time_moment = moment(dates[i]).set({hour:0,minute:0,second:0,millisecond:0});



    //Get the valid exchange rate on this day
    // let exchange_rate = get_valid_rate(timestamped_quoted_rates, tx_time_moment.format('YYYY-MM-DD'));
    // exchange_rate = exchange_rate.bid;
    let balance_cad = parseFloat((exchange_rate * last_balance).toFixed(8));

    //Set the day's beginning balance
     balance_history.push({
       date:tx_time_moment.format(),
       exchange_rate: exchange_rate,
       account_balance: last_balance,
       account_balance_cad: balance_cad,
       currency:currency
     });

     //Loop through the transaction on this given date


    while (transaction_history && transaction_history.length != curTranscIndex && moment(tx_time_moment).isSame(curTransc.date, "day")) {


      last_balance = curTransc.account_balance
      exchange_rate = curTransc.exchange_rate
      curTranscIndex += 1
      curTransc = transaction_history[curTranscIndex]

    }

    //only push that days last balance

    if(curTranscIndex > 0){
      last_tx_of_day = transaction_history[curTranscIndex - 1];

      // console.log("last_tx_of_day ", curTranscIndex);
      balance_cad = parseFloat((last_tx_of_day.exchange_rate * last_tx_of_day.account_balance).toFixed(8));
      balance_history.push({
              date:last_tx_of_day.date,
              exchange_rate: last_tx_of_day.exchange_rate,
              account_balance: last_tx_of_day.account_balance,
              account_balance_cad: balance_cad,
              currency:currency
          });
    }

  }

  end_time = new Date()
  console.log("");
  console.info('time to restructure data tc: %dms', end_time - interm_time)
  interm_time = end_time





   return balance_history

   // return transaction_history;


}

module.exports = {
  balance_history_api,
  get_balance_history
}
