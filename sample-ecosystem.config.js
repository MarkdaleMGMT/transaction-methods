module.exports = {
  apps : [{
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
      DB_USER:<db_username>,
      DB_HOST:<server_ip>,
      DB_PASS:<db_password>,
      DB_DATABASE:<db_name>,
      INVESTMENT_ACNT:<investment_acnt_username>,
      RAKE_ACNT:<rake_acnt_username>
    },
    env_production: {
      NODE_ENV: 'production',
      DB_USER:<db_username>,
      DB_HOST:<server_ip>,
      DB_PASS:<db_password>,
      DB_DATABASE:<db_name>,
      INVESTMENT_ACNT:<investment_acnt_username>,
      RAKE_ACNT:<rake_acnt_username>
    }
  }],

  deploy : {
    production : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
