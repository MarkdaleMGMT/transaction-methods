const moment = require('moment')

// var a = moment('1/1/2012', 'DD/MM/YYYY');
// var b = moment('1/1/2013', 'DD/MM/YYYY');
// var days = b.diff(a, 'days');

const { get_account_transactions_by_date } = require('../models').transaction_model
const { account_balance_by_date, get_account_by_id } = require('../models').account_model

const WEIGHTED_TX_TYPES = ['deposit','withdrawal', 'transfer' , 'fx'];

/* API calculates the rate of return over a specified period */
module.exports = async function rate_of_return(req, res) {

  try{

    let account_id = req.body.account_id;
    let start_date = req.body.start_date;
    let end_date = req.body.end_date;

    // console.log("investment_id", investment_id);
    // console.log("username", username);
    let rate_of_return = await account_rate_of_return(account_id, start_date, end_date);
    res.send({ code: "Successfully calculated rate of return", rate_of_return})
  }
  catch(err){
    console.error(err);
    res.status(400).send({msg: 'Error in generating rate of return', error:err.message});
  };

};




async function account_rate_of_return(account_id, period_start_date , period_end_date){

  let start_date = period_start_date;
  let end_date = period_end_date;


  //get all the transactions for an account
  let account = await get_account_by_id(account_id);
  let account_type = account.account_type;


  //get the balance at the start of the period and end of period
  let start_value = await account_balance_by_date(account_id, start_date);
  let end_value = await account_balance_by_date(account_id, end_date);
  let account_transactions = await get_account_transactions_by_date(account_id, start_date, end_date);

  //if starting balance is 0 adjust the start date & value to first cash flow
  if (start_value == 0 ){

    start_date = moment(account_transactions[0].time).format('YYYY-MM-DD')
    start_value = account_type == 'debit' ? account_transactions[0].amount : -1* account_transactions[0].amount;
    start_value = parseFloat(start_value.toFixed(8));

  }

  //if ending period is 0 adjust the end date & value to first cash flow
  if (end_value == 0){

    let index = account_transactions.length - 1;
    end_date = moment(account_transactions[index].time).format('YYYY-MM-DD')
    end_value = await account_balance_by_date(account_id, end_date);


  }

  console.log("start_date: ",start_date);
  console.log("end_date: ",end_date);



  let weighted_transactions = [];
  let start_date_moment = moment(start_date, 'YYYY-MM-DD');
  let end_date_moment = moment(end_date, 'YYYY-MM-DD');
  let holding_period_days = end_date_moment.diff(start_date_moment, 'days');

  console.log("holding_period_days ", holding_period_days);

  let net_flow = 0;
  let weighted_sum = 0;

  //TODO: dont count the first inflow tx
  for(let i=1; i<account_transactions.length; i++){


    let account_tx = account_transactions[i];

    let tx_amount = parseFloat(parseFloat(account_tx.amount).toFixed(8));
    let amount = 0;



    if(WEIGHTED_TX_TYPES.includes(account_tx.transaction_type)){

      amount = (account_type == 'debit ') ? tx_amount : tx_amount*-1;
      let tx_day_moment = moment(account_tx.time, 'YYYY-MM-DD');
      days_diff = end_date_moment.diff(tx_day_moment, 'days');
      weight=parseFloat((days_diff/holding_period_days).toFixed(8));

      //calculate netflow
      net_flow += amount;

      //calculate weighted sum
      weighted_sum += (amount*weight);

    }


  }
  //get the weighted sum of the amount ---
  console.log("start_value: ",start_value);
  console.log("end_value: ",end_value);
  console.log("net_flow: ",net_flow);

  //formula: (end val - start val - net cash flow)/ start val + weighted sum
  let rate_of_return = (end_value - start_value - net_flow)*100/(start_value + weighted_sum)
  rate_of_return = parseFloat(rate_of_return.toFixed(8))

  //return value
  return rate_of_return;


}
