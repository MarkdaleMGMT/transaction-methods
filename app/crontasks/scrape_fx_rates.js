const dateFormat = require('dateformat')
const { get_fx_rates_config } = require('../models').fx_weight_model
const { update_fx_raw_rates } = require('../foreign_exchange/scrape_fx_rate')

module.exports = async function build_crontasks(){

  let crontasks = [];
  let exchange_rates_config = await get_fx_rates_config();

  for(let i=0; i<exchange_rates_config.length; i++){

    let config = exchange_rates_config[i];
    let cron_interval = generate_cronconfig(config.frequency_min);


    crontasks.push({
      cron_interval,
      cron_fn:async ()=>{

      let datetime = new Date();
      let today = dateFormat(datetime, "dd_mm_yyyy");
      let status = "";

      console.log("-------------------");
      console.log(datetime + " :Running Cronjob : Update Order Book "+config.from_to);

      // let result = await update_order_book(config.source, [config.from_to]);
      console.log(datetime + " :Complete Cronjob : Update Order Book "+config.from_to + " Status: ");
      // console.log(result);


      }
    });


  }//end for

  console.log("built crontasks ", crontasks);
  return crontasks;



};

function generate_cronconfig(freq_min){

  let hours = freq_min/60;
  if(hours >= 1){

    hours = parseInt(hours);
    return `0 0 */${hours} * * *`
  }
  else{

    return `0 */${freq_min} * * * *`

  }
}
