const app = module.exports = require('express')();


//define the endpoints
app.post('/transaction_history', require('./get_transaction_history').transaction_history_api);
app.post('/create_account', require('./create_account'));
app.post('/balance_history', require('./get_balance_history').balance_history_api);
app.post('/rate_of_return', require('./rate_of_return'));
