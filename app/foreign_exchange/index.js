const app = module.exports = require('express')();



app.post('/update_exchange_rates', require('./update_exchange_rates'));
app.post('/exchange', require('./exchange'));
app.post('/generate_rate', require('./generate_rate').generate_rate);
app.post('/get_path', require('./generate_rate').get_path);
app.post('/get_rate', require('./get_rate').get_rate);
app.get('/get_rates', require('./get_quoted_rates').get_quoted_rates_api);
app.get('/get_rates_in_cad', require('./get_rates_in_cad'));
