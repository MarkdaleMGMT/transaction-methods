const dateFormat = require('dateformat');
const moment = require('moment');
const { get_account_transactions_by_date } = require('../models').transaction_model
const { account_balance_by_date, get_account_by_id , get_accounts_per_user} = require('../models').account_model
const { get_transactions_for_user_by_date } = require('../accounts/get_transaction_history')

const WEIGHTED_TX_TYPES = ['deposit','withdrawal', 'transfer' , 'fx'];

/* API calculates the rate of return over a specified period */
module.exports = async function rate_of_return(req, res) {

  try{

    let username = req.body.username;
    let start_date = req.body.start_date;
    let end_date = req.body.end_date;

    // console.log("investment_id", investment_id);
    // console.log("username", username);
    let rate_of_return = await portfolio_rate_of_return(username, start_date, end_date);
    res.send({ code: "Successfully calculated rate of return", rate_of_return})
  }
  catch(err){
    console.error(err);
    res.status(400).send({msg: 'Error in generating rate of return', error:err.message});
  };

};

async function portfolio_rate_of_return(username, start_date_str, end_date_str){

  //get all the accounts for the user
  let accounts = await get_accounts_per_user(username);

  //calculate the start value of the portfolio
  let start_date = start_date_str;
  let end_date = end_date_str;
  let day_before_start_date = new Date(start_date);
  day_before_start_date.setTime(start_date.getTime() - (24*60*60*1000));



  let start_value = await calculate_portfolio_value_cad(accounts,  moment(day_before_start_date).format('YYYY-MM-DD'));
  let end_value = await calculate_portfolio_value_cad(accounts, end_date);

  //get the transaction for user between start and end date
  let transactions = await get_transactions_for_user_by_date(username, start_date, end_date);


  //if starting portfolio balance is 0 adjust the start date & value to first cash flow
  if (start_value == 0 ){

    start_date = moment(transactions[0].time).format('YYYY-MM-DD');

    //find the account of the first transaction
    let transaction_account = accounts.filter( el => {
      return el.account_id == transactions[0].account_id;
    });


    start_value = transaction_account.account_type == 'debit' ? account_transactions[0].amount_cad : -1* account_transactions[0].amount_cad;

    //TODO: get the equivalent CAD value
    start_value = parseFloat(start_value.toFixed(8));

  }

  //if ending period is 0 adjust the end date & value to last cash flow
  if (end_value == 0 ){

    let index = transactions.length - 1;

    //last transaction
    end_date = moment(transactions[index].time).format('YYYY-MM-DD');

    //get the portfolio's balance on the day of the last transaction?
    let transaction_account = accounts.filter( el => {
      return el.account_id == transactions[0].account_id;
    });

    end_value = transaction_account.account_type == 'debit' ? -1*account_transactions[index].amount_cad :  account_transactions[0].amount_cad;

    //TODO: get the equivalent CAD value
    end_value = parseFloat(end_value.toFixed(8));

  }


  let weighted_transactions = [];
  let start_date_moment = moment(start_date, 'YYYY-MM-DD');
  let end_date_moment = moment(end_date, 'YYYY-MM-DD');
  let holding_period_days = end_date_moment.diff(start_date_moment, 'days');

  console.log("holding period days: ", holding_period_days);

  let net_flow = 0;
  let weighted_sum = 0;

  //TODO: dont count the first inflow tx
  for(let i=1; i<transactions.length; i++){


    let account_tx = transactions[i];
    let tx_amount = parseFloat(parseFloat(account_tx.amount_cad).toFixed(8));
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

  let rate_of_return = (end_value - start_value - net_flow)*100/(start_value + weighted_sum)
  rate_of_return = parseFloat(rate_of_return.toFixed(8));

  //return value
  return rate_of_return;


}

async function calculate_portfolio_value_cad(accounts, date){

  let portfolio_value_cad = 0;

  for(let i=0; i<accounts.length; i++){

    portfolio_value_cad += await account_balance_by_date(accounts[i].account_id, date);
  }

  return portfolio_value_cad;

}
