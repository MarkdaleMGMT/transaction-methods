module.exports = {
  apps : [{
      name:'load_config',
      script:'./load_config.js',
       env: {
      NODE_ENV: 'development',
      DB_USER:'app',
      DB_HOST:'142.93.148.141',
      DB_PASS:'3b391ec5',
      DB_DATABASE:'development'
    }

  },{
    name: 'server',
    script: "npm",
    args : "start server.js",
    // script: './server.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    // args: 'one two',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      DB_HOST:'',
      DB_USER:'',
      DB_PASS:'',
      DB_DATABASE:'',
      INVESTMENT_ACNT:'',
      RAKE_ACNT:'',
      FX_ACNT:'',
      FAUCET_ACNT:'',
      WITHDRAWAL_FEES_ACNT:'',
      ADMIN_USER:'',
      EMAIL_SENDER:'',
      DB_BACKUP_EMAIL:'',
      GMAIL:'',
      GMAIL_PASS:'',
      BTC_PAY_HOST:'',
      BTC_PAY_PORT:'',
      BTC_PAY_RPC_USER:'',
      BTC_PAY_RPC_PASS:'',
      CLAM_PAY_HOST:'',
      CLAM_PAY_PORT:'',
      CLAM_PAY_RPC_USER:'',
      CLAM_PAY_RPC_PASS:'',


    },
    env_production: {
      NODE_ENV: 'production',
      DB_HOST:'',
      DB_USER:'',
      DB_PASS:'',
      DB_DATABASE:'',
      INVESTMENT_ACNT:'',
      RAKE_ACNT:'',
      FX_ACNT:'',
      FAUCET_ACNT:'',
      WITHDRAWAL_FEES_ACNT:'',
      BTC_PAY_HOST:'',
      BTC_PAY_PORT:'',
      BTC_PAY_RPC_USER:'',
      BTC_PAY_RPC_PASS:'',
      CLAM_PAY_HOST:'',
      CLAM_PAY_PORT:'',
      CLAM_PAY_RPC_USER:'',
      CLAM_PAY_RPC_PASS:'',
      EMAIL_SENDER:'',
      DB_BACKUP_EMAIL : '',
      ADMIN_USER:''
    }
  }]
};
