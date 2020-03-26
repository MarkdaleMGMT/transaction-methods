const { backup_database } = require('./backup_db');
const scrape_fx_rate_crontasks = require('./scrape_fx_rates')
const calculate_rate_crontasks = require('./calculate_fx_rate')
const update_investment_balance = require('../transactions/global_update_all_investments')
const cron = require("node-cron");

// backup_database();
// scrape_fx_rate_crontask();

async function schedule_and_run_crontasks(){

  //mail a db backup every midnight
  //cron.schedule("0 0 * * *",backup_database);

  //run global update for all investments
  //cron.schedule("0 1 * * *", update_investment_balance);

  cron.schedule("0 0 * * *", midnight_jobs)

  //scrape raw rates
  let scrape_fx_crons = await scrape_fx_rate_crontasks();
  for(let i=0; i<scrape_fx_crons.length; i++){
    cron.schedule(scrape_fx_crons[i].cron_interval,()=>{ scrape_fx_crons[i].cron_fn(); });
  }


  //calculate rates
  let calculate_rate_crons = await calculate_rate_crontasks();
  for(let i=0; i<calculate_rate_crons.length; i++){
    cron.schedule(calculate_rate_crons[i].cron_interval,()=>{ calculate_rate_crons[i].cron_fn(); });
  }



}

midnight_jobs = async () => {
	console.log("[Cron Task] Running Midnight Tasks")
	console.log("[Cron Task] Sending Backup Database")
	await backup_database();
	console.log("[Cron Task] Completed Backup Database")

	console.log("[Cron Task] Starting Global Update")
	await update_investment_balance();
	console.log("[Cron Task] Completed Global Update")
}


module.exports = {
  schedule_and_run_crontasks
};
