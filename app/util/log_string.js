async function log_status(api_name, notes =""){
    let time = new Date();
    console.log(`[${time}] ${api_name} | ${notes}`)
  }

  async function log_error(api_name, notes ="", err){
    let time = new Date();
    console.error(`[${time}] ${api_name} | ${notes}`)
    console.error(err)
  }

  module.exports = {
    log_status,
    log_error
  };
  
  