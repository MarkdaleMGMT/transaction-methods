const shell = require('shelljs');
const dateFormat = require('dateformat')
const { mysql_config } = require('../../config')

DB_BACKUP_PATH='/backup/db_backup'



module.exports = function backup_database(){



  let datetime = new Date();
  let today = dateFormat(datetime, "dd_mm_yyyy")
  let status = ""
  console.log("-------------------");
  console.log(datetime + " :Running Cronjob : Backup started for database "+mysql_config.database);

  shell.mkdir('-p', '${DB_BACKUP_PATH}/${today}');

  let db_backup_command =
  `mysqldump -h localhost -P 3306 --single-transaction --default-character-set=utf8 ${mysql_config.database} `
  +`| gzip > ${DB_BACKUP_PATH}/${today}/${mysql_config.database}-${today}.sql`

  console.log("command: \n",db_backup_command);



  if (shell.exec(db_backup_command).code !== 0) {
      status = "Database backup failed";
      console.log(status);
      shell.echo(status);
      shell.exit(1);
  }
  else{
      console.log(status);
      status = "Database backup complete";

  }

}
