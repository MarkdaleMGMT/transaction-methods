'use strict'

function build_insert_transaction(username, credit_debit, amount, created_by,time, transaction_type, memo){

  return  {
    query:"INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES (?,?,?,?,?,?,?)",
    queryValues:[username, credit_debit, amount, created_by, time, transaction_type, memo ]
  };

}



module.exports ={
  build_insert_transaction
}
