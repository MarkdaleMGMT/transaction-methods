var db = require('../util/mysql_connection');


async function log_process_execution(process_name, status){

  let timestamp = new Date().toMysqlFormat();

  let [result,fields] = await db.connection.query(
    "INSERT INTO process_log (timestamp, process_type, status) VALUES (?,?,?)"
    ,[timestamp, process_name, status]);

  return result.insertId;

}

async function get_last_execution(process_name){


  const [rows,fields] = await db.connection.query(
    "SELECT * FROM process_log WHERE process_type = ? ORDER BY timestamp DESC LIMIT 1 "
    ,[process_name]);

  return rows[0];

}

module.exports = {
  log_process_execution,
  get_last_execution
}
