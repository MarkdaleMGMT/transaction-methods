const {db_backup} = require('../../config');
const {get_user_by_username} = require('../models/user_model')
const {send_email} = require('../util/mail')


module.exports = async function withdrawal_email(req, res){

    try{
      let bank = req.body.bank
      let amount = req.body.amount
      let branch_number = req.body.branch_number
      let account_number = req.body.account_number
      let account_holder_name = req.body.account_holder_name
     
      let username = req.body.username
      let user  =  await get_user_by_username(username)
      console.log(user)
      let user_email = user.email

      //send an email to db_backup about the contact form
      let text = `Username:${username}\nEmail: ${user_email}\nBank: ${bank}\nAmount: ${amount}\nBranch Number: ${branch_number}\nAccount Number: ${account_number}\nAccount Holder Name: ${account_holder_name}\n`
        console.log(text);
      let to_admin = await send_email(db_backup.email, `[Withdrawl] [${user_email}]`, text, null);
      console.log("email_admin result: ", to_admin);
      
      //send an email to the user that their email has been recieved
      text = `This is an email to confirm that we have received your withdrawl request. We will notify you once it has been processed!\n`
      let to_user = await send_email(user_email, `[Do Not Reply] We have recieved your withdrawl request!`, text, null);
      console.log("email_user result: ", to_user);

      res.send({ code: "Your withdrawl request has been sent!"})
       
    }
    catch(err){
      console.error(err);
      res.status(400).send({code:"Something went wrong with sending the withdrawl request" , message:err.message})
    }
  };
  
