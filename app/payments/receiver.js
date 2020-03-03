const {db_backup} = require('../../config');


module.exports = async function receiver(req, res){

    try{
  
      res.send({"email":db_backup.email})
    }
    catch(err){
      console.error(err);
      res.status(400).send({msg: 'Error in processing withdrawal', error:err.message});
    }
  };
  
