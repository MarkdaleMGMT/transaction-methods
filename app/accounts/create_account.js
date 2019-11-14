var db = require('../util/mysql_connection')
var { create_user_account } = require('../models/account_model')



/**
 * API for creating a new user account for a particular investment
 * @param  {string} username
 * @param  {int} investment_id
 * @return {JSON}         Returns success

 */
 module.exports = async function create_account(req, res) {

   let username = req.body.username
   let investment_id = req.body.investment_id


   try{
     let account_id = await create_user_account(username,investment_id);
     res.send({ code: "Account creation successful", account_id:account_id })
   }
   catch(err){
     res.status(400).send({msg: 'Deposit failed', error:err.message});
   }



 };
