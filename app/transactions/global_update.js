var db = require('../util/mysql_connection')

var { control_model, user_model, account_model, transaction_model, investment_model } = require('../models')
const uuidv1 = require('uuid/v1');//timestamp

// var control_model = require('../mo/control_model')
// var user_model = require('./user_model')
// var transaction_model = require('../transactions/transaction_model')
// const { build_insert_transaction } = require('../transaction_model')

/**
 * API for updating global clam_balance
 * @param  {int}   investment_id     Investment for which global update is executed
 * @param  {float} amount     New amount of the investment
 * @param  {str} username     Initiator of the global update
 * @return {JSON}         Returns success
 */

 module.exports = async function update_balance_api(req, res) {

   let amount = req.body.amount
   let username = req.body.username
   let investment_id = req.body.investment_id

   let datetime = new Date().toMysqlFormat()

   try{
     let isSuccesful = await update_investment_balance(username,investment_id,amount,datetime);
     if (!isSuccesful){ throw Error ('unable to update balance');}
     res.send({ code: "balance updated", "trial_balance":await transaction_model.get_trial_balance_per_investment(investment_id) })
   }
   catch(err){
     console.error("got err",err);
     res.status(400).send({msg:err.message});
   }


 };


 async function update_investment_balance(username,investment_id,amount,datetime){

    //check if the user is admin, if not throw an error
    let user = await user_model.get_user_by_username(username)

    if(!user || user.level!=0){
     throw new Error('Not authorized to initiate global update');
    }

    //check if the investment exists, if not throw an error
    let investment = await investment_model.get_investment_by_id(investment_id)
    console.log("investment ",investment);
    if(!investment){
      throw new Error('Invalid investment ID');
    }




     //get the clam miner balance and clam miner rake from control table
     let remainder = 0;
     let transaction_event_id = uuidv1(); // ⇨ '3b99e3e0-7598-11e8-90be-95472fb3ecbd'


     let total_affiliate_commission = 0;

     //update get_control_information to take investment_id as input
     const control_data = await control_model.get_control_information(investment_id);

     //fetch the investment account and retrieve balance
     let investment_account = await account_model.get_investment_account(investment_id);
     let rake_account = await account_model.get_rake_account(investment_id);
     let original = await account_model.account_balance(investment_account.account_id);

     //update the field from clam_miner_rake to rake
     let rake_share = parseFloat(control_data.rake);
     let affiliate_share_of_rake = parseFloat(control_data.affiliate_rake);

     let change = amount - original // change in clam_miner_balance
     if( change < 0 ){

       throw new Error('Invalid amount')
     }else if(change ==0){
       console.log("No update required");

       //TODO: email 
       return true;
     }
     console.log("original ",original,"amount ",amount,"\nchange ",change);

     //update to get all accounts per investment
     const accounts = await account_model.get_all_accounts(investment_id);
     console.log("fetched accounts ",accounts.length);


     //list of queries executed within a single transaction
     let transaction_queries = []

     //update debit query
     let debit_investment_accnt = transaction_model.build_insert_transaction(investment_account.account_id, change, 'admin', datetime, 'global update', 'global update for '+investment.investment_name,transaction_event_id, investment_id);
     transaction_queries.push(debit_investment_accnt);


     remainder += change;

     let rake_user_balance = 0;

     //iterate over accounts
     for (let i=0; i< accounts.length; i++){



       let account = accounts[i];
       let account_id = account.account_id;

       console.log("account ",account_id);

       let prev_accnt_balance = await account_model.account_balance(account_id);


       let calculated_balances = account_model.calculate_balances(original, prev_accnt_balance, change, rake_share);
       let new_accnt_balance = calculated_balances['new_accnt_balance'];
       let accnt_balance_change = parseFloat((new_accnt_balance - prev_accnt_balance).toFixed(8));


       // console.log("new_user_balance",new_user_balance);
       console.log(account_id,"-accnt_balance_change-",accnt_balance_change);

       if(accnt_balance_change==0){
         continue; //move on to the next account
       }


       let credit_user_account = transaction_model.build_insert_transaction(investment_account.account_id, accnt_balance_change*-1, 'admin', datetime, 'global update', 'global update for '+investment.investment_name,transaction_event_id, investment_id);
       transaction_queries.push(credit_user_account);
       remainder -= accnt_balance_change;

       //if the user has an affiliate
       let user =  await user_model.get_user_by_username(account.username);
       if (user.affiliate && user.affiliate.length> 0){

         let affiliate_username = user.affiliate;
         let affiliate_user = await user_model.get_user_by_username(affiliate_username);
         if(!affiliate_user){
           console.error("affiliate user ",affiliate_username, " does not exist");
           continue;
         }

         let affiliate_accnt = await account_model.get_account_by_investment(affiliate_username,investment_id);
         let affiliate_accnt_id = null;

         //check if affiliate has an account in the investment
         if(!affiliate_accnt){
           //if affiliate does not have an account
           //create a new account for the affiliate in that investment
            affiliate_accnt_id = await account_model.create_user_account(affiliate_username,investment_id);
         }
         else{
           affiliate_accnt_id=affiliate_accnt.account_id;
         }

         //calculate affiliate commision and credit the affiliate with that balance
         let affiliate_commission = affiliate_share_of_rake*calculated_balances['rake_balance'];
         affiliate_commission = parseFloat(affiliate_commission.toFixed(8));

         if (affiliate_commission == 0){
           continue; // move on to the next account
         }

         //update debit query
         let credit_affiliate_accnt = transaction_model.build_insert_transaction(affiliate_accnt_id, affiliate_commission*-1, 'admin', datetime, 'global update', 'affiliate commission',transaction_event_id, investment_id);
         transaction_queries.push(credit_affiliate_accnt);
         console.log("affiliate_commission",affiliate_commission);

         //add commision to the sum of affiliate commissions
         //subtract the affiliate balance from sum
         total_affiliate_commission+=affiliate_commission;
         remainder-=affiliate_commission;

       }//end if affiliate


     }//end for

     // remainder of sum is the rake balance OR rake_amount - affiliate_commission + remainder

     // let rake_amount = (rake_share * change);
     console.log("total_affiliate_commission",total_affiliate_commission);
     let rake_amount = parseFloat((rake_share * change - total_affiliate_commission).toFixed(8));

     remainder -= rake_amount;
     console.log("remainder ",remainder);

     console.log("rake_amount ",rake_amount);


     let credit_rake_balance = parseFloat((rake_amount + remainder).toFixed(8));

     // fetch rake user and update credit query
     let credit_rake_user = transaction_model.build_insert_transaction(rake_account.account_id,credit_rake_balance*-1, 'admin', datetime, 'global update', 'rake', transaction_event_id, investment_id);
     transaction_queries.push(credit_rake_user);



     let results = await db.connection.begin_transaction(transaction_queries);


     // console.log("got results",results[0]);
     let rows_affected = 0;
     for(let x=0; x < results.length; x++){
       console.log("results[x]",results[x][0].affectedRows);
       rows_affected+= results[x][0].affectedRows;
     }

     console.log("rows affected",rows_affected);
     console.log("remainder",remainder);

     return rows_affected == transaction_queries.length;


 }
