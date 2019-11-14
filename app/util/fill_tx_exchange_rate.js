const { get_all_investments } = require('../models').investment_model
const { get_quoted_rates_with_validity, get_valid_rate } = require('../models').fx_quoted_rates
var db = require('../util/mysql_connection')
var { send_email } = require('./mail')
const moment = require('moment')

module.exports = async function fill_tx_with_valid_rates(){


  console.log("fill_tx_with_valid_rates ....")
  //get all currencies except CAD
  let investments = await get_all_investments();
  let currencies = new Set();
  let investment_currency_map = {}

  console.log("investments", investments)
  for( i in investments){

    console.log("i ", i)
    if(investments[i].currency != 'CAD'){
      currencies.add(investments[i].currency)
    }


    investment_currency_map[investments[i].investment_id] = investments[i].currency
  }


  console.log("currencies ", currencies);
  //get the quoted rates for each currency from the table and store it in a hash map
  let quoted_rates_hashmap = {}
  for (let currency of currencies.values()){

    console.log("currency ", currency);
    quoted_rates_hashmap[currency] = await get_quoted_rates_with_validity(currency, 'CAD');
  }

  // console.log("quoted_rates_hashmap", quoted_rates_hashmap)

  //get the investmentid - currency mapping

  //iterate over each transaction and get the timestamp
  const [txs, fields] = await db.connection.query("SELECT * FROM transaction WHERE exchange_rate = 0");
  let update_query_array = [];


  console.log(investment_currency_map)

  for(let i=0; i<txs.length; i++){

    console.log(i,"...\n", investment_currency_map[txs[i].investment_id]);
    // console.log("investment i ", quoted_rates_hashmap[investment_currency_map[txs[i].investment_id]]);
    //get the valid exchange rate based on the transaction time

    let exchange_rate = 1;
    if (investment_currency_map[txs[i].investment_id] !='CAD'){
      let tx_time_moment = moment(txs[i].time);
      exchange_rate = get_valid_rate( quoted_rates_hashmap[investment_currency_map[txs[i].investment_id]], tx_time_moment.format('YYYY-MM-DD HH:mm:ss'));
      exchange_rate =  exchange_rate.bid;
    }


    //build the query to update
    update_query_array.push({
      query:"UPDATE transaction SET exchange_rate = ?  WHERE transaction_id = ?",
      queryValues:[exchange_rate, txs[i].transaction_id]
    });




  }

  //run the query in batch transactional mode
   console.log("batch updating the tx table")
   let results = await db.connection.begin_transaction(update_query_array);


   // console.log("got results",results[0]);
   let rows_affected = 0;
   for(let x=0; x < results.length; x++){
     console.log("results[x]",results[x][0].affectedRows);
     rows_affected+= results[x][0].affectedRows;
   }

   console.log("rows affected",rows_affected);

   return rows_affected == update_query_array.length;

   console.log("FX Updated")

  //once done log the output or send an email :)
  // send_email(['ayesha.h@live.com'], 'FX', text, attachments)




}
