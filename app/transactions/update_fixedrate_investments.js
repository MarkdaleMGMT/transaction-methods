const { get_user_by_username } = require('../models').user_model

/**
 * API for updating global balance of fixed rate investments
 * @param  {string} username     Initiator of the global update
 * @return {JSON}         Returns success
 */
module.exports = async function update_fixedrate_investment_api(req,res){

  let username = req.body.username;
  try{
    let status = await update_fixedrate_investment(username);
    res.send(status);
  }
  catch(err){
    console.error("got err",err);
    res.status(400).send({msg:err.message});
  }

};

async function update_fixedrate_investment(username){
  //check if the user is admin, if not throw an error
  let user = await user_model.get_user_by_username(username)

  if(!user || user.level!=0){
   throw new Error('Not authorized to initiate global update');
  }

  //check if the fixed rate investments process has run today

  //if so, return a status message saying process already ran
  //get all the fixed rate investments (i.e. fixed rate )

  //log the process execution

  
}
