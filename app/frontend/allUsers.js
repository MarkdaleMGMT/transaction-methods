var {user_model} = require('../models')


sortUsers = async (users) => {
	let allUsers = []
    let admins = []
    for(let i=0; i<users.length; i++){
        let user = users[i]
        let balance = await user_model.get_balance(user.username)
        if(user.level != 0 || user.username == "rake_user"){
            allUsers.push({username: user.username, clam_balance: balance, email: user.email})    
        }
        if(user.level == 0){
            admins.push({username: user.username})
        }
        
    }
    return {users: allUsers, admins: admins}


} 
module.exports = async function allusers_api(req, res) {
	try{
		let users = await user_model.get_all_users()
		let sorted = await sortUsers(users)
	    res.send({code: "success", users: sorted.users, admins: sorted.admins})
 	}
 	catch(err){
 		res.status(400).send({msg: 'Failed getting all users', err});	
 	}
 }