const app = module.exports = require('express')();
// const transaction_methods = require('./transaction_methods')
// const { twoDigits } = require('../util/common.js')
//
// Date.prototype.toMysqlFormat = function() {
//     return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
// };


//define the endpoints
app.post('/transaction_history', require('./get_transaction_history'));
app.post('/balance', require('./get_balance'));
