var {user_model} = require('../models')
var md5 = require('md5')

module.exports = async function user_data_api(req, res) {
	try{
        let username = req.params.username
		let user = await user_model.get_user_by_username(username)
		let ref_code = md5(user.username).slice(0,5)
	    res.send({code: "success", clam_balance: user.clam_balance, ref_code: ref_code})
 	}
 	catch(err){
 		res.status(400).send({msg: 'Failed getting user data', err});	
 	}
 }