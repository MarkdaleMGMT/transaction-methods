const dateFormat = require('dateformat');

const { get_user_by_username } = require('../models').user_model;
const { log_process_execution,  get_last_execution } = require('../models').process_log;
const { account_balance, get_investment_account } = require('../models').account_model;
const { get_control_information, get_fixedrate_investments } = require('../models').control_model;
const { update_investment_balance } = require('./global_update');


const PROCESS_NAME = 'update_fixedrate_investment'
/**
 * API for updating global balance of fixed rate investments
 * @param  {string} username     Initiator of the global update
 * @return {JSON}         Returns success
 */
module.exports = async function update_fixedrate_investment_api(req,res){

  let username = req.body.username;
  try{
    let status = await update_fixedrate_investment(username);
    res.send(status);
  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({msg:err.message});
  }

};

async function update_fixedrate_investment(username){
  //check if the user is admin, if not throw an error
  let user = await get_user_by_username(username)

  if(!user || user.level!=0){
   throw new Error('Not authorized to initiate global update');
  }

  //check if the fixed rate investments process has run today
  let last_execution = await get_last_execution(PROCESS_NAME);

  if(last_execution){
    let todays_date = dateFormat(new Date(),'dd mmm yyyy');
    let last_execution_date = dateFormat(new Date(last_execution.timestamp),'dd mmm yyyy');

    //if so, return a status message saying process already ran
    if(todays_date == last_execution_date){
      throw new Error("Fixed rate investment balance already ran once today");
    }
  }

  //get all the fixed rate investments (i.e. fixed rate )
  let fixedrate_investments = await get_fixedrate_investments();
  let status = [];
  let datetime = new Date().toMysqlFormat();

  console.log("fixedrate_investment_ids",fixedrate_investments);

  for(let i=0; i<fixedrate_investments.length; i++){

    let investment_id = fixedrate_investments[i].investment_id;
    let investment_status = "success";

    try{


    //get old balance
    let investment_account = await get_investment_account(investment_id);
    let old_balance = await account_balance(investment_account.account_id);
    let investment_config = await get_control_information(investment_id);

    console.log("investment_account",investment_account);
    console.log("old_balance",old_balance);

    //calculate new balance
    let new_balance = parseFloat(((1+investment_config.fixed_rate_investment) * old_balance).toFixed(8));
    console.log("new_balance",new_balance);
    //run global update with new balance
    let investment_status = await update_investment_balance('admin',investment_id,new_balance,datetime);
    }
    catch(err){
      console.error(err);
      investment_status = err.messsage;
    }

    status.push({
      investment_id,
      investment_status
    });


  }

  //log the process execution
  await log_process_execution(PROCESS_NAME,'success');
  return status;


}
