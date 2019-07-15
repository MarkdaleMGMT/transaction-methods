// const util = require('util');
const { rpc_call } = require('../../util/clam_miner_rpc_client');
const { get_account_by_investment } = require('../../models').account_model;

//TODO: clean the project structure
const { deposit } = require('../../transactions/deposit');
const { transfer_clams } = require('./util')
const { clamcoinColdStorage } = require('../../../global_config')




module.exports = async function check_deposit(username, investment_id){

  // console.log("config ",global_config);
  console.log("clamcoinColdStorage ",clamcoinColdStorage);
  let status=[]

  //get the deposit address
  let account = await get_account_by_investment(username, investment_id);
  let deposit_address = account.deposit_address;

  //check the unspent amount on the deposit address
  let response = await rpc_call('listunspent',[0, 9999999, [deposit_address]]);
  console.log("response", response);

  let result = response;

  if(result.length == 0 ){
    status.push({status:'no deposit received', amount:0});
    return status;
  }
  for(let i=0; i< result.length; i++){


    let single_utxo = result[i];
    let amount = result[i].amount

    if(result[i].confirmations >= 6){



      //push the amount to a cold storage
      let input_tx_id = result[i].txid;
      let vout = result[i].vout;
      // let amount = result[i].amount;
      let transferStatus = false, depositStatus = false;

      console.log("input tx id ",input_tx_id);

      //TODO: move cold storage address to the db
      transferStatus = await transfer_clams(input_tx_id, vout, amount, deposit_address, clamcoinColdStorage);
      // transferStatus = await transfer_btc(input_tx_id, vout, amount, deposit_address, '2MzRKRQ2X4GmBbfLbCkXR3ty9xKCnkbrvDn');


      //trigger deposit, TODO: add additional checks?
      if (transferStatus){
        depositStatus = await deposit('admin',investment_id,username,amount, new Date().toMysqlFormat());
          //update the status
          status.push({
            status: depositStatus? 'received':'error processing on system',
            amount:amount
          });
      }
      else{
        status.push({
          status:'pending',
          amount:amount
        });
      }
    }
    else{
      status.push({
        status:'waiting for confirmations',
        amount:amount
      });
    }



  }//end for




  return status;
}

// check_deposit("ayesha",2);
