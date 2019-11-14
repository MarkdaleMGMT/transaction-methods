const app = module.exports = require('express')();


//define the endpoints
// app.post('/balance_sheet', require('./currency_balance_sheet'));
app.post('/trial_balance', require('./trial_balance'));
