const mysql = require("mysql2/promise");
const { mysql_config } = require('../../config')


var pool = mysql.createPool(mysql_config);

exports.connection = {

    query: async function (query,queryValues){
      return await pool.query(query,queryValues);
    },

    begin_transaction: async function(queriesWithValues){

      try{

        var connection = await pool.getConnection();
        console.log("acquired connection");

        await connection.beginTransaction();
        console.log("transaction started");

        const queryPromises = [];

        queriesWithValues.forEach((queryWithValues, index) => {
            queryPromises.push(connection.query(queryWithValues.query, queryWithValues.queryValues));
        });
        let results = await Promise.all(queryPromises);
        console.log("results",results);

        await connection.commit();
        await connection.release();

        return Promise.resolve(results);
      }
      catch(err){
        console.log("error",err);
        await connection.rollback();
        await connection.release();

        return Promise.reject(err);
      }

    },

    release_all_connections: async function(){

      await pool.end();
      console.log("all connections in the pool have ended")

    }
};
