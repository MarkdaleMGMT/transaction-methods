const app = module.exports = require('express')();
// const transaction_methods = require('./transaction_methods')
const { twoDigits } = require('../util/common.js')

Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};


//define the endpoints
app.post('/deposit', require('./deposit'));
app.post('/withdrawal', require('./withdrawal'));
app.post('/global_update', require('./global_update'));
app.post('/transfer', require('./transfer'));
app.post('/rollback', require('./rollback'));
