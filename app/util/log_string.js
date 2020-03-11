async function log_status(api_name, notes =""){
    let time = new Date();
    console.log(`[${time}] ${api_name} | ${notes}`)
  }

  async function log_error(api_name, notes =""){
    let time = new Date();
    console.log(`[${time}] ${api_name} | ${notes}`)
  }

  module.exports = {
    send_email
  };
  
  