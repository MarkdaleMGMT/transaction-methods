const app = module.exports = require('express')();


//define the endpoints
app.post('/create_account', require('./create_account'));
app.post('/balance_history', require('./get_balance_history').balance_history_api);
