const app = module.exports = require('express')();
// const transaction_methods = require('./transaction_methods')
const { twoDigits } = require('../util/common.js')

Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};


//define the endpoints
app.post('/deposit', require('./deposit').deposit_api);
app.post('/withdrawal', require('./withdrawal').withdrawal_api);
app.post('/global_update', require('./global_update').update_balance_api);
app.post('/transfer', require('./transfer'));
app.post('/rollback', require('./rollback'));
app.post('/trial_balance', require('./trial_balance'));
app.post('/balance_sheet_summary', require('./balance_sheet_summary'));

app.post('/auto_global_update', require('./global_update_all_investments'));
