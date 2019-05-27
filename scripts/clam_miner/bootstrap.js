const fs = require('fs');
const axios = require("axios");


async function sync_miner(start_index, end_index, path){

  const pad = "000";

  for(let i=start_index; i<= end_index; i++){

    let str = "" + start_index;
    let ans = pad.substring(0, pad.length - str.length) + str;
    let file_name = "bootstrap-"+ans+".dat";
    
    console.log("download file name:", file_name, " ...");
    const file = fs.createWriteStream(path+"/"+file_name);
    const response = await axios.get("https://s3.amazonaws.com/dooglus/"+file_name);
    response.data.pipe(file);

   console.log("done");
  }


}

sync_miner(184, 257,'/root/bootstrap-files')
