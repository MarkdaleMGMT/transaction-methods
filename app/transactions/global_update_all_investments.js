const { get_balance, get_investments_with_api_info } = require('../models/api_info_model');
const { get_user_by_username } = require('../models/user_model');
const { update_investment_balance } =require('./global_update');

const bcrypt = require('bcrypt');



// /**
//  * API for running global update for all investments with API access info
//  * @param  {str} username     Initiator of the global update
//  * @param  {str} password     password of user 'username'
//  * @return {JSON}         Returns status of global update of individual assesment
//  */

 /*
module.exports = async function global_update_multi_investments(req, res){

  try{

    let username = req.body.username;
    let password = req.body.password;
    let result = await update_multi_investments_balance(username, password);
    res.send({ code: "Successfully fetched balance", result });
  }
  catch(err){
    console.error(err);
    res.status(400).send({msg: 'Error in updating investment balance', error:err.message});
  }
};*/

module.exports = async function update_investments_balance(){

    let result = [];

    //check if user is admin and if the password hash matches that in the db
    //let user = await get_user_by_username(username);

    //if not authorized or authenticated, throw and error
    // if(!user || user.level!=0){
    //  throw new Error('Not authorized to initiate global update');
    // }

    // console.log(password, user.password);
    // const match = await bcrypt.compare(password, user.password);
    //
    // console.log("match", match);
    // if(!match){
    //   throw new Error('Authentication failed');
    // }

    //iterate over all the investments that have API access info
    let datetime = new Date().toMysqlFormat()
    let investment_ids = [];
    investment_ids = await get_investments_with_api_info();
    console.log("investment_ids ", investment_ids);

    //for each investment
    for(let i=0; i< investment_ids.length; i++){

      let investment_id = investment_ids[i];
      console.log("running global update for investment_id ", investment_id, " ....");
      //get the balance
      let balance = await get_balance(investment_id);
      if(!balance) continue;

      //run global update
      let isSuccesful = await update_investment_balance(username,investment_id,balance,datetime);
      if (!isSuccesful){ console.error('unable to update balance ' + investment_id);}
      result.push({ investment_id, isSuccesful });

    }
    return result;
}
