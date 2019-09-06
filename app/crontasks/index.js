const { backup_database } = require('./backup_db');
const scrape_fx_rate_crontask = require('./scrape_fx_rates')
const cron = require("node-cron");

// backup_database();
scrape_fx_rate_crontask();

async function schedule_and_run_crontasks(){

  //mail a db backup every midnight
  // cron.schedule("0/1 0 * * *",backup_db);



  let scrape_fx_crons = await scrape_fx_rate_crontask();
  // console.log("orderbook_crons ",orderbook_crons);
  for(let i=0; i<scrape_fx_crons.length; i++){
  
  cron.schedule(scrape_fx_crons[i].cron_interval,()=>{ scrape_fx_crons[i].cron_fn(); });
  //cron.schedule(scrape_fx_crons[i].cron_interval,()=>{ scrape_fx_crons("Running Task ",i); });
  }



}


module.exports = {
  schedule_and_run_crontasks
};
