var db = require('../util/mysql_connection');
const axios = require("axios");
const { poloniex, bitfinex } = require('../exchanges');
const { get_investment_by_id } = require('./investment_model')

async function get_balance(investment_id){


  let investment = await get_investment_by_id(investment_id);
  const [apis, fields] = await db.connection.query("SELECT * FROM api_access_info WHERE investment_id = ?",[investment_id]);

  let balance = 0;

  for(let i=0; i<apis.length; i++){
    let api = apis[i];

    if(api['type'] == 'miner'){
      balance += await get_miner_balance(api['base_url'],api['address']);
    }
    else if (api['type'] == 'lending bot'){
      balance += await get_lending_bot_balance(api['description'],api['base_url'],api['api_key'],api['secret'],investment['currency']);
    }


  }
  console.log("total balance ", balance);
  return parseFloat(balance);

}

async function get_miner_balance(explorer_url, miner_address){

  //make an http call
  // console.log("trying: "+explorer_url+miner_address );
  try {
    const response = await axios.get(explorer_url+miner_address);
    const data = response.data;
    console.log(data);

    return parseFloat(data);


  } catch (error) {
    console.log(error);
  }

}

async function get_lending_bot_balance(exchange_name,url, api_key, secret, currency){
  //make an API call
  //might need an additional field
  let balance = 0;
  if(exchange_name == 'poloniex'){
    balance = await poloniex.get_wallet_balance(url, api_key, secret, 'lending', currency)
  }
  else if (exchange_name == 'bitfinex'){
    balance = await bitfinex.get_wallet_balance(url, api_key, secret, 'lending', currency)
  }

  return balance;

}



module.exports ={
  
  get_balance
}
