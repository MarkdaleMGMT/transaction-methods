const moment = require('moment')
const { get_account_transactions_by_date } = require('../models').transaction_model
const { account_balance_by_date, get_account_by_id } = require('../models').account_model

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

async function portfolio_rate_of_return(username, start_date, end_date){

  //get all the accounts for the user

  //for each of the account get the transactions

    //convert the value of the currency to the equivalent CAD value using the exchange rate --- must be granular to the minute/second level
    //store the equivalent CAD value

    //append to the overall transaction history

  //order by the datetime

  //adjust the time period and the start/end value

  //calculate the weighted sum and netflow



}
