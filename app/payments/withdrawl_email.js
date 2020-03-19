const {db_backup} = require('../../config');


module.exports = async function withdrawal_email(req, res){

    try{
      let bank = req.body.bank
      let amount = req.body.amount
      let branch_number = req.body.branch_number
      let account_number = req.body.account_number
      let account_holder_name = req.body.account_holder_name
      let user_email = req.body.user_email
      let username = req.body.username

      //send an email to db_backup about the contact form
      let text = `Username:${username}\n
        Email: ${user_email}\n
        Bank: ${bank}\n
        Amount: ${amount}\n
        Branch Number: ${branch_number}\n
        Account Number: ${account_number}\n
        Account Holder Name: ${account_holder_name}\n`
      let to_admin = await send_email(db_backup.email, `[Withdrawl] [${user_email}]`, text, null);
      console.log("email_admin result: ", to_admin);
      
      //send an email to the user that their email has been recieved
      text = `This is an email to confirm that we have received your withdrawl request. We will notify you once it has been processed!\n`
      let to_user = await send_email(user_email, `[Do Not Reply] We have recieved your withdrawl request!`, text, null);
      console.log("email_user result: ", to_user);

      res.send({ code: "Your withdrawl request has been sent"})
       
    }
    catch(err){
      console.error(err);
      res.status(400).send({code:"Something went wrong with sending the withdrawl request" , message:err.message})
    }
  };
  
