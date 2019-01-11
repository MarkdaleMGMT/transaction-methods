var { user_model} = require('../models')


login = async (username, hashedPassword) => {
	console.log("username", username, "hash", hashedPassword)
	// let query = "SELECT * FROM user WHERE username = ? AND password = ?;"
	let query = await user_model.get_user_by_username(username);
	console.log('query', query)
	let successfulLogin = query.password == hashedPassword ? true : false
	let result = successfulLogin ? {result: successfulLogin, level: query.level, clam_balance: query.clam_balance} : {result: successfulLogin}
	return result

} 
module.exports = async function login_api(req, res) {
 	console.log("body", req.body)
 	console.log("LOGIN IN")
 	let username = req.body.username
 	let password = req.body.password
    // let hashedPassword = passwordHash.generate(password);
    let hashedPassword = password
    console.log("hash", hashedPassword)
    try{
	    let result = await login(username, hashedPassword)
	    if(!result.result){
	    	throw Error ('Incorrect Password')
	    }
    	res.send({ code: "Login successful", level: result.level, clam_balance: result.clam_balance})

	}
	catch(err){
		res.status(400).send({msg: 'Login failed', err});	
	}
 }