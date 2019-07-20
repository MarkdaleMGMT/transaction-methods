var db = require('../util/mysql_connection');
const { writeFileAsync } = require('../util/common');
const { toCamelCase } = require('../util/common');

var global_config = {};

async function load_config(){

  const [rows,fields] = await db.connection.query("SELECT * FROM global_config");

  transformedConfigs = {};
  for(let i=0; i< rows.length; i++){

    transformedConfigs[toCamelCase(rows[i]['param'])] = rows[i]['value'];

  }


  console.log("transformedConfigs ",transformedConfigs);

  //write config to file
  let result = await writeFileAsync('global_config.js', 'module.exports='+JSON.stringify(transformedConfigs), 'utf8');
  // console.log("config file written result ", result);
  //

  // global_config = transformedConfigs;



}



module.exports ={
  load_config

}
// let global_config = get_all_config();
// console.log("global_config ", global_config);
