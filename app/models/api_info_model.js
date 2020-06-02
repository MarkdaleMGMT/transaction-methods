var db = require('../util/mysql_connection');
const axios = require("axios");
const util = require("util");
const { poloniex, bitfinex } = require('../exchanges');
const { get_investment_by_id } = require('./investment_model')


async function get_investments_with_api_info(){

  const [investments, fields] = await db.connection.query("SELECT distinct(investment_id) as 'investment_id' FROM api_info WHERE investment_id IS NOT NULL");


  let investment_ids = [];
  for(let i=0; i<investments.length; i++){
    investment_ids.push(investments[i].investment_id);
  }
  return investment_ids;

}


async function get_exchange_api(source){

  const [exchange_apis, fields] = await db.connection.query("SELECT * FROM api_info WHERE type = 'exchange' and description = ?",[source]);
  return exchange_apis[0];

}

async function get_balance(investment_id){

  // console.log("get balance: investment_id ", investment_id);

  let investment = await get_investment_by_id(investment_id);
  console.log(util.format("investment: %s, currency: %s", investment.investment_name, investment.currency));
  const [apis, fields] = await db.connection.query("SELECT * FROM api_info WHERE investment_id = ?",[investment_id]);

  let balance = 0;



  for(let i=0; i<apis.length; i++){
    let api = apis[i];

    if(api['type'] == 'miner'){
      balance += await get_miner_balance(api['base_url'],api['address']);
      b += await Get(api['base_url']);
    }
    else if (api['type'] == 'lending bot'){
      balance += await get_lending_bot_balance(api['description'],api['base_url'],api['api_key'],api['secret'],investment['currency']);
    }

    console.log("total balance ", balance);
  }
  console.log("total balance ", balance);
  return parseFloat(balance);

}

async function get_miner_balance(explorer_url, miner_address){

  //make an http call
  // console.log("trying: "+explorer_url+miner_address );
  try {
    const response = await axios.get(explorer_url+miner_address);
    console.log("waaaaaa", response);
    console.log("url", explorer_url);
    
    
    const data = response.data;
    console.log(data);

    return parseFloat(data);


  } catch (error) {
    console.log(error);
  }

}



const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

async function Get(base_url){
  let Httpreq = new XMLHttpRequest(); // a new request
  Httpreq.open("GET",base_url,false);
  Httpreq.send(null);
  return Httpreq.responseText;          
}

let json_obj = JSON.parse(Get(base_url));
console.log("this is the balance: "+json_obj.balance);


// const Http = new XMLHttpRequest();
// const url='https://prohashing.com/explorerJson/getAddress?address=xLKv8vGuey7sRjxCu8w23bh9GGdYrRc1QU&coin_id=255';
// Http.open("GET", url);
// Http.send();

// Http.onreadystatechange = (e) => {
//   console.log('yupppp', Http.responseText)
// }








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
  get_investments_with_api_info,
  get_balance,
  get_exchange_api
}
