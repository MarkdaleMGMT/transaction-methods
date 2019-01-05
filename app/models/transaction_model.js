'use strict'

function build_insert_transaction(username, amount, created_by,time, transaction_type, memo){

  return  {
    query:"INSERT INTO transaction(username, amount, created_by,time, transaction_type, memo) VALUES (?,?,?,?,?,?)",
    queryValues:[username, amount, created_by, time, transaction_type, memo ]
  };

}





module.exports ={
  build_insert_transaction
}
