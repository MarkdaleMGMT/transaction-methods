const app = require('express')();

app.get('/', (req, res) => {
  res.send({msg: 'hello! Server is up and running'});
});

app.use('/transactions', require('./transactions'));
app.use('/users', require('./users'));
app.use('/accounts', require('./accounts'));
app.use('/investments', require('./investments'));
app.use('/currency', require('./currency'));
app.use('/fx', require('./foreign_exchange'));
app.use('/payments', require('./payments'));
app.use('/contact', require('./contact'))

const {backup_database} = require('./crontasks/backup_db');
app.get('/backup_db', (req, res) => {
  backup_database()
});

// the catch all route
app.all('*', (req, res) => {
  res.status(404).send({msg: 'not found'});
});

module.exports = {
  routes:app
}
