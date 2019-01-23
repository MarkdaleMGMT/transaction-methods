const app = require('express')();



app.get('/', (req, res) => {
  res.send({msg: 'hello! Server is up and running'});
});

app.use('/transactions', require('./transactions'));

app.use('/frontend', require('./frontend'));
// app.use('/accounts', require('./accounts'));

app.use('/users', require('./users'));



// the catch all route
// app.all('*', (req, res) => {
//   res.status(404).send({msg: 'not found'});
// });


module.exports = {
  routes:app
}
