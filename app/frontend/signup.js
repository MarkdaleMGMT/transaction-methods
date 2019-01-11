var {user_model } = require('../models')


module.exports = async function signup_api(req, res) {
	try{
 		let result = await user_model.create_user(req.body)
 		console.log("sign up result", result)
 		res.send({code: "Signup successful"})
 	}
 	catch(err){
 		res.status(400).send({msg: 'Login failed', err});	
 	}
 }