var db = require('../util/mysql_connection');
var { get_user_by_username } = require('../models/user_model');
var { create_investment_account, create_rake_account, create_withdrawal_fees_account } = require('../models/account_model');
var { get_investment_by_name, create_investment } = require('../models/investment_model');
var { add_control_info } = require('../models/control_model');


/**
 * API for creating a new investment
 * @param  {str} investment_name     Name of the investment
 * @param  {str} description   Description about the investment
 * @param  {str} currency    Initiator of the request
 * @param  {str} username    Initiator of the request
 * @param  {float} rake    Rake collected by platform
 * @param  {float} affiliate_rake    Rake collected by affiliate
 * @param  {float} fx_rake    Rake collected when exchanging investment
 * @return {JSON}         Returns success
 */
 module.exports = async function create_investment_api(req, res) {

   let username = req.body.username
   let investment_name = req.body.investment_name
   let description = req.body.description
   let currency = req.body.currency

   let rake = parseFloat(req.body.rake)
   let affiliate_rake = parseFloat(req.body.affiliate_rake)
   let fx_rake = parseFloat(req.body.fx_rake)


   try{

     let investment_id = await create_investment_fn(username, investment_name, description, currency, rake, affiliate_rake, fx_rake);
     res.send({ code: "Investment creation successful", investment_id:investment_id })
   }
   catch(err){
     res.status(400).send({msg: 'Investment creation failed', error:err.message});
   }



 };

 async function create_investment_fn(username, investment_name, description, currency, rake, affiliate_rake, fx_rake){

   //TODO: check if username is authorized to create investments
   //if unauthorized, throw an error
   let user = await get_user_by_username(username)

   if(!user || user.level!=0){
    throw new Error('Not authorized to create investments');
   }

   //check if investment exists
   let investment = await get_investment_by_name(investment_name)
   if(investment){ throw new Error('Investment already exists')}

   //create an investment in the investment table
   let investment_id = await create_investment(investment_name, description, currency, username);

   //create a record in the control table
   await add_control_info(investment_id, rake, affiliate_rake, fx_rake);

   //create investment and rake accounts
   let investment_acnt_id = await create_investment_account(investment_id)
   let rake_acnt_id = await create_rake_account(investment_id)
   let withdrawal_acnt_id = await create_withdrawal_fees_account(investment_id)



 }
