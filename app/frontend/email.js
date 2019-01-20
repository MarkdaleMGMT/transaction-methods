var { user_model} = require('../models')

module.exports = async function confirm_email(req, res){
	let key = req.params.key
	let confirm = await user_model.confirm_email(key)
	return res.send("Email Confirmed")

}