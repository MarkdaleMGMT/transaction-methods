const app = module.exports = require('express')();




app.post('/exchange', require('./exchange'));
app.post('/get_path', require('./calculate_fx_rate').get_path);

app.post('/scrape_rate', require('./scrape_fx_rate'));
app.post('/calculate_rate', require('./calculate_fx_rate').calculate_fx_rate);
app.post('/quote_rate', require('./quote_fx_rate').quote_fx_rate);
app.get('/quote_rates', require('./quote_rates').get_quoted_rates_api);
app.get('/quote_rates_in_cad', require('./quote_rates_in_cad'));
