const express = require('express')
const bodyParser = require('body-parser')
const { routes } = require('./app');
const { createTerminus } = require('@godaddy/terminus');


const http = require('http');
// var https = require('https');


const port = 3000 // port
const app = express()


var { connection } = require('./app/util/mysql_connection')




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
// set CORS
app.use(function(req, res, next) {
    let origins = ['localhost']

    if (req.headers.origin) {
        for (let i = 0; i < origins.length; i++) {
            let origin = origins[i]
            if (req.headers.origin.indexOf(origin) > -1) {
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
            }
        }
    }

    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, id, token, login_uuid')
    next()
});

// mount the routes
app.use(routes);


const server = http.createServer(app);

createTerminus(server, {
  signal: 'SIGINT',
   healthChecks: {
    '/healthcheck': onHealthCheck,
  },
  onSignal
});

function onSignal() {
  console.log('server is starting cleanup');
  // start cleanup of resource, like databases or file descriptors

  //close the connection pool
  connection.release_all_connections()

}

async function onHealthCheck() {
  console.log('server is health check');
  // checks if the system is healthy, like the db connection is live
  // resolves, if health, rejects if not
}



server.listen(port,function (err) {
  if (err) {
    throw err
  }

  console.log(`server is listening on ${port}...`)
});

// app.listen(port, function (err) {
//   if (err) {
//     throw err
//   }
//
//   console.log(`server is listening on ${port}...`)
// })
