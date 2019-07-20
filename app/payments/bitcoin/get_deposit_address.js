// const util = require('util');
const { get_account_by_investment, update_deposit_address } = require('../../models').account_model;
const { rpc_call } = require('../../util/bitcoin_rpc_client');


module.exports = async function get_deposit_address(username, investment_id){


  let account = await get_account_by_investment(username, investment_id);
  console.log("account ", account);
  // return "1";

  let deposit_address = "";

  if(account.deposit_address){
    console.log("deposit does not exist");
    deposit_address = account.deposit_address;
  }else{
    //generate a deposit address
    console.log("deposit exist");
    //TODO: might need to change the mempool

    let response = await rpc_call('getnewaddress', []);
    deposit_address = response.result
    console.log("deposit_address", deposit_address);


    //store the deposit address in db
    await update_deposit_address(account.account_id, deposit_address);



  }

  return deposit_address;

}
