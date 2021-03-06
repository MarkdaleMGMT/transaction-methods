const dateFormat = require('dateformat')
const { get_fx_rates_config } = require('../models').fx_weight_model
const { update_fx_raw_rates } = require('../foreign_exchange/scrape_fx_rate')
const { generate_cronconfig } = require('../util/common')

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
      console.log(datetime + " :Running Cronjob : Scrape FX Rate "+config.from_to);

      let result = await update_fx_raw_rates(config.source, [config.from_to]);
      console.log(datetime + " :Complete Cronjob : Scrape FX Rate "+config.from_to + " Status: ",result);



      }
    });


  }//end for

  console.log("built crontasks ", crontasks);
  return crontasks;



};
