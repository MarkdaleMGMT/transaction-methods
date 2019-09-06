const dateFormat = require('dateformat');
const { get_fx_paths } = require('../models').fx_weight_model;
const { generate_cronconfig } = require('../util/common');
const { calculate_rate } = require('../foreign_exchange/calculate_fx_rate')

//get all the currency pairs from fx_path table

//calculate_rate

module.exports = async function build_crontasks(){

  let crontasks = [];
  let fx_paths_config = await get_fx_paths();

  crontasks = fx_paths_config.map(fx_path => {

    let cron_interval = generate_cronconfig(fx_path.frequency_min);

    return {
      cron_interval,
      cron_fn:async ()=>{

      let datetime = new Date();
      let today = dateFormat(datetime, "dd_mm_yyyy");
      let status = "";
      let [ from_currency, to_currency ] = fx_path.from_to.split("_");

      console.log("-------------------");
      console.log(datetime + " :Running Cronjob : Calculate FX Rate "+fx_path.from_to);

      let result = await calculate_rate(from_currency, to_currency );
      console.log(datetime + " :Complete Cronjob : Calculate FX Rate "+fx_path.from_to + " Status: ",result);

      }
    }

  });

}
