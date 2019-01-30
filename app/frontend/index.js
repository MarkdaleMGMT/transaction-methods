const app = module.exports = require('express')();
// const transaction_methods = require('./transaction_methods')
const { twoDigits } = require('../util/common.js')

Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};


//define the endpoints
app.post('/login', require("./login"))
app.post('/signup', require("./signup"))
app.get('/all_users', require("./allUsers"))
app.get('/clam_balance', require("./clamBalance"))
app.get('/user_data/:username', require("./userData"))
app.post('/reset_password', require('./resetPassword'))
app.get('/email/:key', require("./email"))