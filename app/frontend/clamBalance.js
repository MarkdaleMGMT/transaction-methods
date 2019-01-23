var { control_model, user_model } = require('../models')



module.exports = async function allusers_api(req, res) {
	try{
		let balance = await user_model.get_balance('clam_miner')
	    res.send({code: "Got clam balance successfully", clam_miner_balance: balance})
 	}
 	catch(err){
 		res.status(400).send({msg: 'Failed getting clam balance', err});	
 	}
 }