const { rpc_call } = require('../../util/bitcoin_rpc_client');


async function transfer_btc(input_tx_id, vout, amount, from_address, to_address){


  try{
    // let privkey = get_priv_key(from_address);
    // let address_details = validate_address(from_address);
    let min_tx_fee = await get_min_relay_fee();

    let amount_obj = {};
    amount_obj[to_address] = amount-min_tx_fee;

    let raw_tx_obj = [[  {
        txid:input_tx_id,
        vout:vout
      }]];
    raw_tx_obj.push(amount_obj);

    console.log("raw_tx_obj", raw_tx_obj);

    //create a raw transaction
    let raw_tx_response = await rpc_call('createrawtransaction', raw_tx_obj);
    let raw_tx_hash = raw_tx_response.result;
    console.log("raw_tx_hash ",raw_tx_hash);

    //sign raw transaction
    let sign_tx_response = await rpc_call('signrawtransactionwithwallet', [raw_tx_hash]);
    let signed_tx_hash = sign_tx_response.result.hex;
    console.log("signed_tx_hash ",signed_tx_hash);

    //test mempool acceptance
    let mempool_acceptance = await rpc_call('testmempoolaccept',[[signed_tx_hash]]);
    let acceptance_result = mempool_acceptance.result[0];
    console.log("acceptance result", acceptance_result);

    if(!acceptance_result.allowed) throw new Error("Transaction not accepted");

    //send raw transaction

    let send_tx_response = await rpc_call('sendrawtransaction', [signed_tx_hash]);
    let txid = send_tx_response.result;
    console.log("txid ",send_tx_response);

    return {txid, 'status':'successful'};
  }catch(err){
    console.error(err.message);
    return {'status':'failed'};
  }


}

async function get_priv_key(address){

    let response = await rpc_call('dumpprivkey', [address]);
    let privkey = response.result;
    return privkey;

}

async function validate_address(address){

    let response = await rpc_call('validateaddress', [address]);
    let result = response.result;

    console.log(result);
    return result;

}

async function get_min_relay_fee(){
  let response = await rpc_call('getnetworkinfo', []);
  let fee = response.result.relayfee;

  console.log("fee ", fee);
  return parseFloat(fee);
}

async function get_balance(address){

  //TODO: or we can get the balance of the wallet

  let balance = 0;
  let response = await rpc_call('listunspent',[0, 9999999, [address]]);

  // console.log("response", response);

  let result = response.result;

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

async function get_wallet_balance(){
  let response = await rpc_call('getbalance', []);
  let result = response.result;

  console.log(result);
  return parseFloat(result);
}

async function send_btc(rx_address, amount, memo){
  let response = await rpc_call('sendtoaddress', [rx_address, amount, memo]);
  let tx_id = response.result;

  return tx_id;
}


module.exports = {
  transfer_btc,
  send_btc,
  get_wallet_balance,
  get_min_relay_fee
}

// get_wallet_balance();
// get_balance('2MzRKRQ2X4GmBbfLbCkXR3ty9xKCnkbrvDn');
// console.log("get balance by address",get_balance('2MzRKRQ2X4GmBbfLbCkXR3ty9xKCnkbrvDn'));
