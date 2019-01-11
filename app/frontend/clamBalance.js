var { control_model } = require('../models')



module.exports = async function allusers_api(req, res) {
	try{
		let clam = await control_model.get_control_information()
	    res.send({code: "Got clam balance successfully", clam_miner_balance: clam.clam_miner_balance})
 	}
 	catch(err){
 		res.status(400).send({msg: 'Failed getting clam balance', err});	
 	}
 }