const { get_quoted_rate, get_quoted_bid} = require('./quote_fx_rate');
const { get_investment_by_id } = require('../models/investment_model');
const { get_account_by_investment, get_fx_account , account_balance, create_user_account } = require('../models/account_model');
const { build_insert_transaction } = require('../models/transaction_model');
const { base_currency } = require('../../config');
var db = require('../util/mysql_connection');


const util = require('util');
const uuidv1 = require('uuid/v1');//timestamp


/**
 * API for exchanging currency from one investment to another
 * @param  {str} username     Initiator of the global update
 * @param  {int} source_investment    Investment from where the currency is exchange
 * @param  {int} target_investment    Investment to which the equivalent value of currency is transferred
 * @param  {int} amount   amount of currency (i.e. currency of investment_from)
 * @param  {str} custom_memo (optional)   user defined memo
 * @return {JSON}         Returns success
 */
module.exports = async function exchange(req,res){

  try{
    let username = req.body.username;
    let source_investment_id = req.body.source_investment;
    let target_investment_id = req.body.target_investment;
    let amount = req.body.amount;
    let memo = req.body.custom_memo;
    // let rate = req.body.rate;


    let isSuccesful = await exchange_investment(username, source_investment_id, target_investment_id, amount, memo);
    res.send({ code: "Exchange transaction successful", isSuccesful })
  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({code:"Failed to exchange investment" , message:err.message});
  }

}

async function exchange_investment(username, source_investment_id, target_investment_id, amount, memo){

  //TODO: Optimize the number of queries made to the db

  let time = new Date().toMysqlFormat()
  //get source and target investments
  let source_investment = await get_investment_by_id(source_investment_id);
  let target_investment = await get_investment_by_id(target_investment_id);

  let source_currency = source_investment.currency;
  let target_currency = target_investment.currency;

  let src_fx_rate = await get_quoted_bid(source_currency, base_currency);
  let target_fx_rate = await get_quoted_bid(target_currency, base_currency);

  let transaction_event_id = uuidv1();

  //get user's account
  //ASSUMPTION src_user_account always exists and target user account MAY exist
  let src_user_account = await get_account_by_investment(username,source_investment_id);
  let target_user_account = await get_account_by_investment(username, target_investment_id);
  let target_user_account_id;

  if (!target_user_account){
    //create a target user account
    target_user_account_id = await create_user_account(username, target_investment_id);
    target_user_account = await get_account_by_investment(username, target_investment_id);
  }else{
    target_user_account_id = target_user_account.account_id;
  }


  //get fx accounts
  let src_fx_account = await get_fx_account(source_investment_id);
  let target_fx_account = await get_fx_account(target_investment_id);



  let quoted_rate = await get_quoted_rate(source_currency, target_currency);
  let rate = 1;

  if (source_currency+'_'+target_currency == quoted_rate.from_to){
    rate = quoted_rate.bid
  }else{
    rate = 1/quoted_rate.ask
  }

  console.log("src-target ",source_currency+'_'+target_currency);
  console.log("quoted rate ",quoted_rate.from_to);
  console.log("rate ", rate);

  let target_amount = parseFloat((rate * amount).toFixed(8));

  //Check if target fx has enough balance
  let fx_balance = await account_balance(target_fx_account.account_id);
  if (fx_balance < target_amount){
    throw new Error("Insufficient balance in fx");
  }


  //list of queries executed within a single transaction
  let transaction_queries = []
  let tx_description = util.format("fx from %s(%s) to  %s(%s)",source_investment.investment_name, source_currency, target_investment.investment_name, target_currency );

  let credit_src_fx = build_insert_transaction(src_fx_account.account_id, src_fx_account.account_type, src_fx_account.username, -1*amount, username, time, 'fx', tx_description, transaction_event_id, source_investment_id, src_fx_rate, memo);
  let debit_src_acnt = build_insert_transaction(src_user_account.account_id,src_user_account.account_type, src_user_account.username, amount, username, time, 'fx', tx_description, transaction_event_id, source_investment_id, src_fx_rate, memo);

  let credit_target_acnt = build_insert_transaction(target_user_account.account_id, target_user_account.account_type, target_user_account.username, -1*target_amount, username, time, 'fx', tx_description, transaction_event_id, target_investment_id, target_fx_rate, memo);
  let debit_target_fx = build_insert_transaction(target_fx_account.account_id, target_fx_account.account_type, target_fx_account.username, target_amount, username, time, 'fx', tx_description, transaction_event_id, target_investment_id, target_fx_rate, memo);

  //src investment
  transaction_queries.push(credit_src_fx);
  transaction_queries.push(debit_src_acnt);

  //target investment
  transaction_queries.push(credit_target_acnt);
  transaction_queries.push(debit_target_fx);

  let results = await db.connection.begin_transaction(transaction_queries);

  let rows_affected = 0;
  for(let x=0; x < results.length; x++){
    console.log("results[x]",results[x][0].affectedRows);
    rows_affected+= results[x][0].affectedRows;
  }

  console.log("rows affected",rows_affected);
  // console.log("remainder",remainder);

  return rows_affected == transaction_queries.length;


}
