var {user_model} = require('../models')

module.exports = async function user_data_api(req, res) {
	try{
        let username = req.params.username
		let user = await user_model.get_user_by_username(username)
	    res.send({code: "success", clam_balance: user.clam_balance})
 	}
 	catch(err){
 		res.status(400).send({msg: 'Failed getting user data', err});	
 	}
 }