var {user_model, email_model } = require('../models')
var md5 = require('md5');

async function check_referral(code){
	let users = await user_model.get_all_users()
	for(let i=0; i< users.length; i++){
		console.log("refcode", md5(users[i].username).slice(0,5), "code", code)
		if(md5(users[i].username).slice(0,5) == code){
			return users[i].username
		}
	}
	return false
}
module.exports = async function signup_api(req, res) {
	try{
		let verify = await check_referral(req.body.code)
		console.log("verify", verify)
		if(verify != false){
			let result = await user_model.create_user(req.body)
	 		console.log("sign up key", result)
	 		let add_ref = await user_model.add_referral(req.body.username, verify)
	 		console.log("add ref", add_ref)
	 		console.log("email", req.body.email)
	 		let link = "http://localhost:3000/frontend/email/" + result
	 		let send_email = await email_model.send_email(req.body.email, "please confirm your email by going to this link: " + link)
	 		res.send({code: "Signup successful", ref_code: md5(req.body.username).slice(0,5)})
		}

 		else{
 			console.log("Incorrect ref code")
 			throw new Error("Incorrect referral code")
 		}
 	}
 	catch(err){
 		res.status(400).send({msg: 'Signup failed', err});	
 	}
 }