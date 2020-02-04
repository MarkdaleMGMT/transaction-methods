const app = module.exports = require('express')();

//define the endpoints
app.post('/', require('./contact_us'));

