const { rpc_call } = require('../../util/clam_miner_rpc_client');
const { clamcoinTxFee, clamcoinChangeAddress } = require('../../../global_config');


//TODO: optimize to send in one tx
async function transfer_clams(input_tx_id, vout, amount, from_address, to_address){


  try{
    // let privkey = get_priv_key(from_address);
    // let address_details = validate_address(from_address);
    let min_tx_fee = parseFloat(clamcoinTxFee)


    let amount_obj = {};
    amount_obj[to_address] = amount - min_tx_fee;

    let raw_tx_obj = [[  {
        txid:input_tx_id,
        vout:vout
      }]];
    raw_tx_obj.push(amount_obj);

    console.log("raw_tx_obj", raw_tx_obj);

    //create a raw transaction
    let raw_tx_response = await rpc_call('createrawtransaction', raw_tx_obj);
    let raw_tx_hash = raw_tx_response;
    console.log("raw_tx_hash ",raw_tx_hash);

    //sign raw transaction
    let sign_tx_response = await rpc_call('signrawtransaction', [raw_tx_hash]);
    let signed_tx_hash = sign_tx_response.hex;
    console.log("signed_tx_hash ",signed_tx_hash);

    let complete_signatures = sign_tx_response.complete
    if (!complete_signatures) throw new Error("Transaction does not have complete signatures")

    //test mempool acceptance
    // let mempool_acceptance = await rpc_call('testmempoolaccept',[[signed_tx_hash]]);
    // let acceptance_result = mempool_acceptance.result[0];
    // console.log("acceptance result", acceptance_result);

    // if(!acceptance_result.allowed) throw new Error("Transaction not accepted");

    //send raw transaction

    let send_tx_response = await rpc_call('sendrawtransaction', [signed_tx_hash]);
    let txid = send_tx_response;
    console.log("txid ",txid);

    if(!txid) throw new Error("Can not create a transaction")
    console.log("txid ",send_tx_response);

    return {txid, 'status':'successful'};
  }catch(err){
    console.error(err.message);
    // return {'status':'failed'};
  }


}


async function get_balance(){

  //TODO: or we can get the balance of the wallet

  let balance = 0;
  let response = await rpc_call('listunspent',[6, 9999999]);

  // console.log("response", response);

  let result = response;

  for(let i=0; i< result.length; i++){


    let single_utxo = result[i];
    let amount = result[i].amount

    if(result[i].confirmations >= 6){
      balance+=parseFloat(amount);
    }

  }//end for
  console.log(balance);
  return balance;
}

async function list_unspent(){
  let response = await rpc_call('listunspent', [6, 9999999]);
  let utxos = response;
  return utxos;
}


async function send_clams(amount, tx_fee, rx_address){

  // console.log("bitcoinTxFee", bitcoinTxFee);
  let total_amount = 0;
  let utxos = await list_unspent();

  amount = parseFloat(amount.toFixed(8));

  let tx_inputs = [];

  //TODO: optimization of UTXOs
  // utxos.sort(function(a, b) {
  //   return parseFloat(b.amount) - parseFloat(a.amount);
  // });



  for(let i=0; i<utxos.length; i++){

    if(total_amount >= (amount + tx_fee))
      break;
    else{
      total_amount+=utxos[i].amount;
      tx_inputs.push({
        txid:utxos[i].txid,
        vout:utxos[i].vout
      });

    }
  }

  //we have sufficient inputs
  let change = parseFloat((total_amount - amount - tx_fee).toFixed(8));

  console.log("total amount ", total_amount);
  console.log("calculated total amount ", change + tx_fee + amount);



  let tx_outputs = {};
  tx_outputs[rx_address]= amount;
  //send change to change address, leaving out tx fee
  tx_outputs[clamcoinChangeAddress] = change;

  let raw_tx_obj = [tx_inputs, tx_outputs];
  console.log("raw_tx_obj");
  console.log( raw_tx_obj);

  //create a raw transaction
  let raw_tx_response = await rpc_call('createrawtransaction', raw_tx_obj);
  let raw_tx_hash = raw_tx_response;
  console.log("raw_tx_hash ",raw_tx_hash);

  if(!raw_tx_hash) throw new Error("Unable to process transaction")


  //sign raw transaction
  let sign_tx_response = await rpc_call('signrawtransaction', [raw_tx_hash]);
  let signed_tx_hash = sign_tx_response.hex;
  console.log("signed_tx_hash ",signed_tx_hash);
  //

  let complete_signatures = sign_tx_response.complete
  if (!complete_signatures) throw new Error("Transaction does not have complete signatures")


/*
  //test mempool acceptance
  let mempool_acceptance = await rpc_call('testmempoolaccept',[[signed_tx_hash]]);
  let acceptance_result = mempool_acceptance.result[0];
  console.log("acceptance result", acceptance_result);

  if(!acceptance_result.allowed) throw new Error("Transaction not accepted");*/

  //send raw transaction

  let send_tx_response = await rpc_call('sendrawtransaction', [signed_tx_hash]);
  let txid = send_tx_response;
  console.log("txid ",send_tx_response);

  return txid;


}

// async function get_min_relay_fee(){
//   let response = await rpc_call('getinfo', []);
//   let fee = response.paytxfee;
//
//   console.log("fee ", fee);
//   return parseFloat(fee);
// }

module.exports = {
  transfer_clams,
  get_balance,
  list_unspent,
  send_clams
}
