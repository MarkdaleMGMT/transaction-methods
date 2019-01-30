var { user_model, email_model} = require('../models')

async function makePass() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
async function check_email(email){
	let users = await user_model.get_all_users()
	let check = false
	for(let i=0; i<users.length; i++){
		if(users[i].email == email){
			check = true
		}
	}
	return check
}
module.exports = async function reset_pass(req, res){
	let email = req.body.email
	console.log("reset pass", email)
	try{
		let email_check = await check_email(email)
		console.log("email check", email_check)
		if(email_check){
			let new_pass = await makePass()
			console.log("new pass", new_pass)
			let text = "Your new password is: " + new_pass
			let reset = await user_model.reset_password(email, new_pass)
			console.log("reset", reset)
			let send_email = await email_model.send_email(email, text)
			console.log("send email", send_email)
			res.send({code: "Reset successful"})
		}
		else{
			throw new Error("Email does not exist!")
		}
	}
	catch(err){
		console.log(err)
		res.status(400).send({msg: 'Reset failed', err});	
	}

}