const app = module.exports = require('express')();



app.post('/update_exchange_rates', require('./update_exchange_rates'));
