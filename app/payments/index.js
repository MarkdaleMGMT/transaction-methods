const app = module.exports = require('express')();

app.post('/check_deposit', require('./check_deposit'));
app.post('/get_deposit_address', require('./get_deposit_address'));
app.post('/withdraw', require('./withdraw'));
app.post('/secret', require('./secret'));
app.get('/secret', require('./secret_get'));

app.post('/withdrawl_email', require('./withdrawl_email'));

app.get('/receiver', require('./receiver'));


