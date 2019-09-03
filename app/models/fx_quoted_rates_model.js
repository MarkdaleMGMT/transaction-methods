var db = require('../util/mysql_connection');
const moment = require('moment');

async function log_quoted_rate(timestamp, from_to, bid, ask){

  let midpoint = (bid + ask)/2.0;
  let [result,fields] = await db.connection.query(
    "INSERT INTO fx_quoted_rates (timestamp, from_to, bid, ask, mid) VALUES (?,?,?,?,?)"
    ,[timestamp, from_to, bid, ask, midpoint]);

  return result.insertId;

}

async function get_latest_quoted_rate(from_currency, to_currency){
  console.log("get_latest_quoted_rate from_currency ", from_currency," to_currency ", to_currency);
  const [rows,fields] = await db.connection.query("SELECT * FROM fx_quoted_rates WHERE from_to = ? OR from_to = ? ORDER BY timestamp DESC LIMIT 1",[from_currency + '_' + to_currency, to_currency + '_' + from_currency]);


  return rows[0];
}


async function get_quoted_rates_with_validity(from_currency, to_currency){

  const from_to = from_currency+"_"+to_currency;
  const [rates, fields] = await db.connection.query("SELECT * FROM fx_quoted_rates WHERE from_to = ? OR from_to = ? ORDER BY timestamp ASC",[from_currency+"_"+to_currency, to_currency + '_' + from_currency]);

  let timestamped_rates = [];

  if(from_currency == to_currency){

    timestamped_rates.push(
    {  rate: {
        bid:1,
        ask:1,
        mid:1,
        valid_from : new Date().toISOString(),
        valid_until: null,
        from_to:from_currency+"_"+to_currency
      }}
    );

    return timestamped_rates;
  }


  for(let i=0; i<rates.length; i++){

    let rate = rates[i];

    if(rate.from_to !=from_to){

      const { ask, bid, mid } = rate; //storing the original rates
      rate['bid'] = 1/ask;
      rate['ask'] = 1/bid;
      rate['mid'] = 1/mid;
      rate['from_to'] = from_to;
    }

    rate['valid_from'] = rate.timestamp;
    rate['valid_until'] = rates[i+1]!=null ? rates[i+1].timestamp : null;
    delete rate['timestamp'];

    timestamped_rates.push({ rate });


  }//end for

  return timestamped_rates;

}

function get_valid_rate(timestamped_rates, timestamp){

  let search_timestamp = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
  // console.log(search_timestamp)


  let filtered_rates = timestamped_rates.filter( rate_row => {

    let rate = rate_row.rate;

    let valid_from =  moment(rate.valid_from).format('YYYY-MM-DD HH:mm:ss');
    let valid_until = moment(rate.valid_until).format('YYYY-MM-DD HH:mm:ss');

    // console.log(valid_from,"-", valid_until );
    // console.log("search_timestamp >= valid_from  ", search_timestamp >= valid_from );
    // console.log("search_timestamp < valid_until ", search_timestamp < valid_until, "\n\n");

    // console.log("cond A: ", (rate.valid_until!= null &&  search_timestamp >= valid_from && search_timestamp < valid_until ));
    // console.log("cond B: ", ( rate.valid_until==null && search_timestamp >= valid_from ));
    // console.log("valid_until ", valid_until);/

    let filter_condition =  ((rate.valid_until!= null &&  search_timestamp >= valid_from && search_timestamp < valid_until )  ||
     ( rate.valid_until==null && search_timestamp >= valid_from ));


    return filter_condition;

  });


  //if the search timestamp falls before any of the rates were logged, return the first logged rate
  if(filtered_rates.length == 0 && timestamped_rates.length != 0){
    if( moment(timestamped_rates[0].rate.valid_from).format('YYYY-MM-DD HH:mm:ss') > search_timestamp)
      filtered_rates.push(timestamped_rates[0]);
  }

  return (filtered_rates && filtered_rates.length != 0) ? filtered_rates[0].rate : [];

}

module.exports = {
  log_quoted_rate,
  get_latest_quoted_rate,
  get_quoted_rates_with_validity,
  get_valid_rate
}
