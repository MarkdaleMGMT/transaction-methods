//load configuration
var { load_config } = require('./app/models/global_config_model');
load_config();
console.log("config loaded");
