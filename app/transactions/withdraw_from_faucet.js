//DONE: update create investment to include the faucet accounts
//DONE: update startupscript to create faucet username
//faucet is similiar to a transfer api from faucet account to user account
//put the latest db structure in target.sql

const { get_user_by_username, log_faucet_transfer } = require('../models').user_model
const { get_account_by_id, account_balance, get_faucet_account } = require('../models').account_model
const { get_control_information } = require('../models').control_model
const { transfer_amount } = require('./transfer')
const dateFormat = require('dateformat');


module.exports = async function withdraw_from_faucet_api(req, res){


  try{
    let account_id = req.body.account_id;
    let status = await withdraw_from_faucet(account_id);
    res.send({ status });

  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({msg:err.message});
  }

}

async function withdraw_from_faucet(account_id){

  //check if the user has already ran out of limit for faucet today
  // if not, throw an error
  let user_account = await get_account_by_id(account_id);
  let username = user_account.username;
  let user = await get_user_by_username(username);
  let investment_id = user_account.investment_id;

  if(user.last_faucet_transfer){
    let todays_date = dateFormat(new Date(),'dd mmm yyyy');
    let last_faucet_transfer_date = dateFormat(new Date(user.last_faucet_transfer),'dd mmm yyyy');
    if(todays_date == last_faucet_transfer_date){
      throw new Error("You have withdrawn from faucet once today");
    }
  }

  let control_info = await get_control_information(investment_id);
  let faucet_amount = parseFloat(control_info.faucet_amount);
  if( faucet_amount == 0){
    throw new Error("Faucet disabled for this investment");
  }

  //check if the faucet has enough funds to be withdrawn
  //if not, throw an error
  // let faucet_account = await get_faucet_account(user_account.investment_id);
  // let faucet_balance = await account_balance(faucet_account.account_id);
  // faucet_balance = parseFloat(faucet_balance.toFixed(8));
  // if(faucet_balance < faucet_amount ){
  //   //TODO: email notif
  //   throw new Error("Faucet currently does not have sufficient funds ");
  // }

  //process transfer
  let datetime = new Date().toMysqlFormat()
  let transfer_status = await transfer_amount('admin',process.env.FAUCET_ACNT,username,faucet_amount,datetime, investment_id, 'transfer from faucet to '+username)

  //log the faucet transfer against the user
  await log_faucet_transfer(username, datetime);

  //return the transfer status
  return transfer_status? "Withdrawal from faucet successful":"Withdrawal from faucet failed";
}
