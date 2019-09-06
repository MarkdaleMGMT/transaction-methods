const { backup_database } = require('./backup_db');
//const build_orderbook_crontasks = require('./update_exchange_rates')
const cron = require("node-cron");

backup_database();

async function schedule_and_run_crontasks(){

  //mail a db backup every midnight
  // cron.schedule("0/1 0 * * *",backup_db);



  // let orderbook_crons = await build_orderbook_crontasks();
  // console.log("orderbook_crons ",orderbook_crons);
  // for(let i=0; i<orderbook_crons.length; i++){
  //
  //   // cron.schedule(orderbook_crons[i].cron_interval,()=>{ orderbook_crons[i].cron_fn(); });
  //   // cron.schedule(orderbook_crons[i].cron_interval,()=>{ console.log("Running Task ",i); });
  // }



}


module.exports = {
  schedule_and_run_crontasks
};
