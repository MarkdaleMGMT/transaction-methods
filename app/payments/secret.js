const crypto = require('crypto');


module.exports = async function secret(req, res){

    try{
  
      let user = req.params.user;
      const hash = crypto.createHmac('sha256', user)
                   .update("qoinify")
                   .digest('hex');
  
      res.send(hash)
    }
    catch(err){
      console.error(err);
      res.status(400).send({msg: 'Error in processing withdrawal', error:err.message});
    }
  };
  