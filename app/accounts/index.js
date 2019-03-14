const app = module.exports = require('express')();


//define the endpoints
app.post('/create_account', require('./create_account'));
