const dateFormat = require('dateformat');

const { get_autoconvert_accounts, get_account_by_id } = require('../models').account_model;
const { get_daily_gain } = require('../models').transaction_model;
const { log_process_execution,  get_last_execution } = require('../models').process_log;
const { exchange_investment } = require('../foreign_exchange/exchange');

/**
 * API to convert gains of a user from global update to an investment of their choice
 */
 module.exports = async function convert_gains_to_investment_api(req, res) {

   try{
     let status = await convert_gains_to_investment();
     res.send(status);
   }
   catch(err){
     console.error("got err",err);
     res.status(400).send({msg:err.message});
   }

 };


async function convert_gains_to_investment(){


  //check if autoconvert already ran
  let process_name = 'autoconvert gains';
  let last_execution = await get_last_execution(process_name);

  if(last_execution){
    let todays_date = dateFormat(new Date(),'dd mmm yyyy');
    let last_execution_date = dateFormat(new Date(last_execution.timestamp),'dd mmm yyyy');
    if(todays_date == last_execution_date){
      throw new Error("Autoconvert already ran once today");
    }
  }



  //get all the accounts which opted for auto conversion of gains to investment
  //account level: 0, auto_convert: true
  let status = [];
  let autoconvert_accounts = await get_autoconvert_accounts();
  // let datetime = new Date().toMysqlFormat()

  //for each account get the gains from global update (i.e. gains which have not been converted)

  for(let i=0; i < autoconvert_accounts.length; i++){


    let account_id =  autoconvert_accounts[i].account_id;
    let account = await get_account_by_id(account_id);

    console.log("autoconvert_accounts id",account_id);
    //transaction type: global update (global update gains + affiliate commission)
    let daily_gain = await get_daily_gain(account_id);
    let source_investment_id = autoconvert_accounts[i].investment_id;
    let target_investment_id = autoconvert_accounts[i].autoconvert_investment_id;

    console.log("daily_gain ",daily_gain);
    console.log("source_investment_id ",source_investment_id);
    console.log("target_investment_id ",target_investment_id);


    //get the fx rate and run an fx transaction
    let autoconvert_status = await exchange_investment(account.username, source_investment_id, target_investment_id, daily_gain, 'autoconvert global update gain');
    status.push({account_id, status:autoconvert_status});
    //todo: email based on the status
  }

  await log_process_execution(process_name,'success');
  return status;



}
