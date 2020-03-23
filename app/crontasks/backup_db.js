const shell = require('shelljs');
const dateFormat = require('dateformat')
const moment = require('moment')
const { send_email } = require('../util/mail')
const { mysql_config , db_backup, server_label} = require('../../config')
const fs = require("fs");

const DB_BACKUP_PATH='/backup/db_backup'
const DB_RETAIN_DAYS = 90



async function backup_database(){



  let datetime = new Date();
  let today = dateFormat(datetime, "dd_mm_yyyy")
  let status = ""
  console.log("-------------------");
  console.log(datetime + " :Running Cronjob : Backup started for database "+mysql_config.database);
  console.log(`${DB_BACKUP_PATH}/${today}`);


   //if backup directory does not exist, create it
   try{
	    fs.mkdirSync( `${DB_BACKUP_PATH}/${today}`, { recursive: true });
   }catch(err){
	    console.error(err);
   }


  //shell.mkdir('-p', `${DB_BACKUP_PATH}/${today}`);
  let db_backup_command =
  `mysqldump -p${mysql_config.password} -h localhost -P 3306 --single-transaction --default-character-set=utf8 ${mysql_config.database} `
  +`| gzip > ${DB_BACKUP_PATH}/${today}/${mysql_config.database}-${today}.sql.gz`

  console.log("command: \n",db_backup_command);



  if (shell.exec(db_backup_command).code !== 0) {
      status = "Database backup failed";
      console.log(status);
      shell.echo(status);
      shell.exit(1);
  }
  else{

      status = "Database backup complete";
      console.log(status);

      //mail the file to the configured email address
      console.log("trying to send email....");
      let text = `Attached is the database backup from server: ${server_label}`;
      let attachments = [{
        path: `${DB_BACKUP_PATH}/${today}/${mysql_config.database}-${today}.sql.gz`,
        encoding: 'utf-8'
      }];

      try{
      let result = await send_email(db_backup.email, `Database Backup ${today}`, text, attachments);
      console.log("email result: ",result);
    }catch(err){
      console.error(err);
    }


  }

  //TODO: delete old backups
  let dateOffset = (24*60*60*1000) * (90);
  let date_90_days = new Date();
  date_90_days.setTime(datetime.getTime() - dateOffset);
  let date_90_days_str = dateFormat(date_90_days, "dd_mm_yyyy");




}


//backup_database();


module.exports = {
	backup_database
}
