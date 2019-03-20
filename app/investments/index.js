const app = module.exports = require('express')();


//define the endpoints
// app.post('/balance_sheet', require('./balance_sheet'));
app.get('/accounts', require('./accounts'));
