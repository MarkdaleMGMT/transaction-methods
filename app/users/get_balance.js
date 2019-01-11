var db = require('../util/mysql_connection')
const { get_balance} = require('../models').user_model

/**
 * API to fetch the balance for a specific user
 * @param  {string} username     Username of the user
 * @return {JSON}         Balance and Status
 */
 module.exports = async function get_user_balance_api(req, res) {

   let username = req.body.username

   try{
     let user_balance = await get_user_balance(username);
     res.send({ code: "Success", user_balance })
   }
   catch(err){
     res.status(400).send({msg: 'Unable to fetch user balance', err});
   }



 };


 async function get_user_balance(username){


   try{
     return await get_balance(username);

   }
   catch(err){
     console.log("got err",err);
     throw err;
   }



 }
