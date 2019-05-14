const app = module.exports = require('express')();


//define the endpoints
// app.post('/balance_sheet', require('./balance_sheet'));
app.post('/accounts', require('./accounts'));
app.post('/create', require('./create_investment'));
app.post('/get_balance', require('./get_balance'));
