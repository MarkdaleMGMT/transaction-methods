const { get_autoconvert_accounts } = require('../models').account_model;
const { exchange_investment } = require('../foreign_exchange/exchange');
/**
 * API to convert gains of a user from global update to an investment of their choice
 */
 module.exports = async function convert_gains_to_investment_api(req, res) {

   try{
     let status = await convert_gains_to_investment();
     res.send(summary);
   }
   catch(err){
     res.status(400).send({msg: 'Unable to retrieve balance sheet summary'});
   }

 };


async function convert_gains_to_investment(){

  //get all the accounts which opted for auto conversion of gains to investment
  //account level: 0, auto_convert: true
  let autoconvert_accounts = await get_autoconvert_accounts();
  // let datetime = new Date().toMysqlFormat()

  //for each account get the gains from global update (i.e. gains which have not been converted)

  for(int i=0; i < autoconvert_accounts.length; i++){
    //transaction type: global update (global update gains + affiliate commission)
    let daily_gain = await get_daily_gain(autoconvert_accounts[i].account_id);
    let source_investment_id = autoconvert_accounts[i].investment_id;
    let target_investment_id = autoconvert_accounts[i].autoconvert_investment_id;

    //get the fx rate and run an fx transaction
    let autoconvert_status = await exchange_investment('admin', source_investment_id, target_investment_id, daily_gain, 'autoconvert global update gain'){

    //todo: email based on the status
  }



}
