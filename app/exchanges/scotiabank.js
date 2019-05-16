const axios = require("axios");

async function get_exchange_rate(base_url, param){

  console.log("get_exchange_rate: ",base_url,param);

  let response = await axios.get(base_url);
  let data = response.data.data;
  let search_str_parts = param.split("_");

  console.log("search_str ",search_str_parts);
  console.log("data ",data);

  let fx_rate = data.filter(el=> {
      return el.CURRENCY_CODE == search_str_parts[0]
  })[0];


  if (!fx_rate || fx_rate.length == 0){
    return null;
  }


  return {
    timestamp: new Date().toMysqlFormat(),
    from_to: param,
    source: 'scotiabank',
    bid: parseFloat(fx_rate['CLIENT_BUY']),
    ask: parseFloat(fx_rate['CLIENT_SELL'])
  };
}

module.exports = {
  get_exchange_rate
}
