const { rates_source_currency, rates_target_currency, get_rates_currency_pair, get_currency_pair_info } = require('../models').fx_weight_model;
const { log_quoted_rate } = require('../models').fx_quoted_rates;
const { find_valid_rate } = require('../models').fx_raw_rates;

async function calculate_fx_rate(req, res){

  try{
    let to_currency = req.body.to_currency;
    let from_currency = req.body.from_currency;



    let rate = await calculate_rate(from_currency, to_currency);
    res.send({ code: "rate generated successfully", rate });
  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({msg:err.message});
  }


}

async function get_path(req, res){

  try{
    let to_currency = req.body.to_currency;
    let from_currency = req.body.from_currency;


    let path = await find_exchange_path(from_currency, to_currency);
    res.send({ code: "rate fetched successfully", path  });
  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({msg:err.message});
  }


}

async function calculate_rate(src_currency, target_currency){

  let final_rate_bid = 1;
  let final_rate_ask = 1;

  if( src_currency == target_currency ){
    return 1.0;
  }
  else {

    //TODO: get exchange path
    let currency_pair_info = await get_currency_pair_info(src_currency, target_currency)
    // let exchange_path = ['CLAM', 'BTC', 'USD', 'CAD'];

    if(!currency_pair_info) throw new Error("Exchange rate is not configured on the system")

    let exchange_path = currency_pair_info.path.split(',');
    console.log("exchange_path",exchange_path);

    for(let i=0; i< exchange_path.length - 1; i++){

        let from_currency = exchange_path[i];
        let to_currency = exchange_path[i+1];
        let final_pairwise_bid = 1, final_pairwise_ask = 1;

        console.log("before normalization for", from_currency, "/", to_currency);

        //get normalized weights (could be in either direction )
        let normalized_rates = await get_rates_currency_pair(from_currency, to_currency);
        // console.log("after normalization ", normalized_rates);

        for(let j=0; j < normalized_rates.length; j++){

          //TODO: find the inverse rates
          let [individual_from, individual_to] = [normalized_rates[j].from, normalized_rates[j].to];
          let individual_rate = await find_valid_rate(individual_from, individual_to, normalized_rates[j]['source']);

          if (j==0)
          {
            if(individual_from == from_currency){
              final_pairwise_bid = normalized_rates[j]['weight'] * individual_rate['bid'];
              final_pairwise_ask = normalized_rates[j]['weight'] * individual_rate['ask'];
            }else{
              //rate present in reverse direction
              final_pairwise_bid = normalized_rates[j]['weight'] * 1/individual_rate['ask'];
              final_pairwise_ask = normalized_rates[j]['weight'] * 1/individual_rate['bid'];
            }

          }
          else{
            if(individual_from == from_currency){
              final_pairwise_bid += normalized_rates[j]['weight'] * individual_rate['bid'];
              final_pairwise_ask += normalized_rates[j]['weight'] * individual_rate['ask'];
            }else{

              //rate present in reverse direction
              final_pairwise_bid += normalized_rates[j]['weight'] * 1/individual_rate['ask'];
              final_pairwise_ask += normalized_rates[j]['weight'] * 1/individual_rate['bid'];

            }
          }


      }//end of pairwise rates

      //iterated over all the pairwise rates
      if(i==0){
        final_rate_bid = final_pairwise_bid;
        final_rate_ask = final_pairwise_ask;
      }else{
        final_rate_bid *= final_pairwise_bid;
        final_rate_ask *= final_pairwise_ask;
      }

  }//end for exchange path

  //at this point we have the bid and ask for the requested currency pair

  //find the rates we will quote to the users
  let percentage_change = parseFloat(currency_pair_info.spread);
  let quoted_bid = final_rate_bid / (1 + percentage_change);
  let quoted_ask = final_rate_ask * (1 + percentage_change);

  console.log("% change ", percentage_change);
  console.log("% change + 1 ",(1 + percentage_change));
  console.log("bid", final_rate_bid);
  console.log("ask", final_rate_ask);

  //log the rate in the quoted_fx_rates table
  let timestamp = new Date().toMysqlFormat();
  let from_to = currency_pair_info.from+'_'+currency_pair_info.to;

  await log_quoted_rate(timestamp, from_to, quoted_bid, quoted_ask);

  //return the quoted rate depending on the direction (if the user wants to buy or sell)
  return {
    from_to: from_to,
    //src_currency + '_' + destination_currency,
    bid: quoted_bid,
    ask: quoted_ask
  };

}
}

//TODO: to be modified later
async function find_exchange_path(src_currency, target_currency, exchange_path = [], potential_paths = []){

  //search from currencies

  console.log("src_currency ", src_currency, "target_currency ", target_currency);
  if ( src_currency == target_currency)
  {
    exchange_path.push(src_currency);
    return exchange_path;
  }
  else{
    let rates = await rates_source_currency(src_currency);



    for(let i=0; i< rates.length; i++){

        let rate = rates[i];
        exchange_path.push(rate['from']);
        console.log("exchange_path "+exchange_path);

        return await find_exchange_path(rate['to'], target_currency, exchange_path);
    }
  }
}

module.exports = {
  calculate_fx_rate,
  get_path
};
