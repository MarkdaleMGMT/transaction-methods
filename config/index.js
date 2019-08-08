'use strict'


module.exports = {
  mysql_config :{
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
      multipleStatements: true,
      connectionLimit : 10
  },
  bitcoin_payment_config:{
    host:process.env.BTC_PAY_HOST,
    port:process.env.BTC_PAY_PORT,
    rpc_user:process.env.BTC_PAY_RPC_USER,
    rpc_pass:process.env.BTC_PAY_RPC_PASS
  },
  clamcoin_payment_config:{
    host:process.env.CLAM_PAY_HOST,
    port:process.env.CLAM_PAY_PORT,
    rpc_user:process.env.CLAM_PAY_RPC_USER,
    rpc_pass:process.env.CLAM_PAY_RPC_PASS
  },
  mail_config:{
    sender:process.env.EMAIL_SENDER,
    user:process.env.GMAIL,
    password:process.env.GMAIL_PASS

  },
  db_backup:{
    email:process.env.DB_BACKUP_EMAIL
  }


}
