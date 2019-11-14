const { get_accounts_per_user } = require('../models').account_model;
/**
 * API to get all the accounts that a particular user owns
 * @param  {string} username     username of the user whose accounts you want to fetch
 * @return {JSON}         User Accounts and Status of API Call
 */
module.exports = async function get_user_accounts_api(req, res) {

  let username = req.body.username;

  try{
    console.log("inside get user accounts");
    let accounts = await get_user_accounts(username);
    res.send({ code: "Success", accounts })
  }
  catch(err){
    res.status(400).send({msg: err.message});
  }

};

async function get_user_accounts(username){

  let accounts = [];
  accounts = await get_accounts_per_user(username);
  return accounts;

}
