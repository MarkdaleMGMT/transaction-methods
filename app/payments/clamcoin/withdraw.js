const { rpc_call } = require('../../util/clam_miner_rpc_client');
const { clamcoinWithdrawalFeePercent, clamcoinChangeAddress, clamcoinTxFee } = require('../../../global_config');
const { get_balance, list_unspent, send_clams } = require('./util')
const { get_account_by_investment, account_balance } = require('../../models').account_model;
const { withdraw_cryptocurrency } = require('../../transactions/withdrawal');




module.exports = async function withdraw_clamcoin(username, investment_id, amount, receive_address){

  //check the amount on the hot wallet
  let isSuccesful = false;
  let account = await get_account_by_investment(username, investment_id);

  if(!account){
    throw new Error("account does not exist");
  }

  if(amount <= 0){
      throw new Error("invalid amount");
  }


  let account_id = account.account_id;
  //get the total amount in user's account
  let user_account_balance = await account_balance(account_id);
  let wallet_balance = await get_balance();
  let tx_fee = parseFloat(parseFloat(clamcoinTxFee).toFixed(8));

  //take a withdrawal fee as a percentage pf the amount
  let clamcoin_withdrawal_fee = parseFloat(clamcoinWithdrawalFeePercent) * (amount + tx_fee);
  clamcoin_withdrawal_fee = parseFloat(clamcoin_withdrawal_fee.toFixed(8));

  //if the amount in wallet is less than the amount that needs to be withdrawn (amount + tx fee + withdrawal fee) throw an error
  let amount_to_transfer = parseFloat((amount + tx_fee).toFixed(8)); //inclusive of tx fee
  //total deducted from user = amount + withdrawal fee + tx fee
  let total_deducted = parseFloat((amount_to_transfer + clamcoin_withdrawal_fee).toFixed(8));

  console.log("account balance",user_account_balance);
  console.log("wallet_balance",wallet_balance);
  // console.log("min_tx_fee",min_tx_fee);
  console.log("amount",amount);
  console.log("clamcoin_withdrawal_fee",clamcoinWithdrawalFeePercent, " ",clamcoin_withdrawal_fee);
  console.log("amount_to_transfer",amount_to_transfer);
  console.log("total_deducted",total_deducted);

  //if account balance < total deductions then throw an error
  if(user_account_balance < total_deducted){
    throw new Error("insufficient funds in user account");
  }

  //check if the wallet has enough to send amount to user AND cover tx cost
  if(wallet_balance <  amount_to_transfer){
    throw new Error("insufficient funds on system");
  }

  //TODO: lock withdrawal if user's deposit address has unconfirmed tx


  //we have verified that sufficient balance exists
  //transfer the adjusted amount to the address
  let tx_id = await send_clams(amount, tx_fee, receive_address);

  // call the withdrawal transaction method
  if(tx_id){
    console.log("successful tx ",tx_id);

      is_successful = await withdraw_cryptocurrency('admin', account_id, amount, tx_fee, clamcoin_withdrawal_fee, tx_id,new Date().toMysqlFormat());
  }


  return {
    is_successful,
    tx_id
  };


}
