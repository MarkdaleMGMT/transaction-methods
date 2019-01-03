const app = module.exports = require('express')();
const transaction_methods = require('./transaction_methods')
const { twoDigits } = require('../util/common.js')

Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};


//define the endpoints
app.post('/deposit', transaction_methods.deposit);
app.post('/withdrawal', transaction_methods.withdrawal);
