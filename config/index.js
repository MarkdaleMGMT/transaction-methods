'use strict'

console.log(process.env)

module.exports = {
  mysql_config :{
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
      multipleStatements: true,
      connectionLimit : 10
  }

}
