const mysql = require('mysql')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000 // port

// allow POST requests
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
})
/**
 * Format number to two digits
 **/
function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}
/**
 * Returns current UTC time in MySQL format 
 **/
Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

// development database credentials
const database_pass = {
    host: '165.227.35.11',
    user: 'user',
    password: 'Zh8gqQhSK9meM7uu',
    database: 'dev',
    multipleStatements: true
}

/**
 * API for the deposit transaction
 * @param  {string} username     Username of the user doing the transaction
 * @param  {float} amount    Amount to be deposited
 * @return {JSON}         Returns success
 */
app.post('/deposit', (req, res) => {
    let username = req.body.username
    let amount = req.body.amount
    let credit_amount = amount * -1
    let datetime = new Date().toMysqlFormat()
    const connection = mysql.createConnection(database_pass);
    // transaction row for debit
    let debit_query = "INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('clam_mine', 'debit', " + amount.toString() + ", 'admin', '" + datetime + "', 'deposit', 'deposit') ;"
    // transaction row for credit
    let credit_query = " INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('" + username + "', 'credit', " + credit_amount.toString() + ", 'admin', '" + datetime + "', 'deposit', 'deposit') ;"
    connection.query(debit_query + credit_query, function(err, rows, fields) {
        if (err) {
            // catch errors
            console.log(err)
        }
        if (rows[0] != null && rows[0].solution != undefined) {
            console.log('The solution is: ', rows[0].solution)
        }
    })
    return res.send({ code: "success" })

})

/**
 * API for withdrawal transaction
 * @param  {string} username     Username of the user doing the transaction
 * @param  {float} amount    Amount to be withdrawed
 * @return {JSON}         Returns success
 */
app.post('/withdrawal', (req, res) => {
    let username = req.body.username
    let amount = req.body.amount
    let credit_amount = amount * -1
    let datetime = new Date().toMysqlFormat()
    const connection = mysql.createConnection(database_pass);
    // transaction row for debit
    let debit_query = "INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('" + username + "', 'debit', " + amount.toString() + ", 'admin', '" + datetime + "', 'withdrawal', 'withdrawal') ;"
    // transaction row for credit
    let credit_query = " INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('clam_mine', 'credit', " + credit_amount.toString() + ", 'admin', '" + datetime + "', 'withdrawal', 'withdrawal') ;"
    connection.query(debit_query + credit_query, function(err, rows, fields) {
        if (err) {
            // catch errors
            console.log(err)
        }
        if (rows[0] != null && rows[0].solution != undefined) {
            console.log('The solution is: ', rows[0].solution)
        }
    })
    return res.send({ code: "success" })


})

/**
 * API for updating global clam_balance
 * @param  {float} amount     New amount of the global clam_miner_balance
 * @return {JSON}         Returns success
 */
app.post('/update', (req, res) => {
    let amount = req.body.amount
    let datetime = new Date().toMysqlFormat()
    const connection = mysql.createConnection(database_pass);
    connection.query("SELECT * FROM control;", function(err, rows, fields) {
        let original = rows[0].clam_miner_balance
        let change = amount - original // change in clam_miner_balance
        let rake_share = rows[0].clam_miner_rake
        // inserts transaction row for debit
        let debit_query = "INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('clam_miner', 'debit', " + change.toString() + ", 'admin', '" + datetime + "', 'update_clam_miner', 'update_clam_miner') ;"
        connection.query(debit_query)
        // updates the new clam_miner_balance
        connection.query('UPDATE control SET clam_miner_balance = ?;', [amount])

        connection.query("SELECT * FROM user;", function(err, rows, fields) {
            console.log('update individual user')
            if (err) {
                // catch errors
                console.log('errors', err)
            }
            // iterate through all users
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i]
                let id = row.id
                let previous_balance = row.clam_balance
                let previous_share = row.clam_balance / original
                let new_balance = previous_balance + (change * previous_share) - (rake_share * change * previous_share) // formula for new balance
                let user_balance_change = (new_balance - previous_balance) * -1 // -1 since credit is negative
                console.log('new_balance', new_balance)
                // update user clam_balance
                connection.query('UPDATE user SET clam_balance = ? WHERE id = ?;', [new_balance, id])
                // add transaction row of increase in balance (credit)
                let credit_query = "INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('" + row.username + "', 'credit', " + user_balance_change.toString() + ", 'admin', '" + datetime + "', 'update_clam_miner', 'update_clam_miner') ;"
                connection.query(credit_query)

            }
            let rake_amount = (rake_share * change) * -1
            // update rake_user rake and set transaction row
            connection.query("SELECT * FROM user WHERE username = 'rake_user';", function(err, rows, fields) {
                let rake_user = "INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('rake_user', 'credit', " + rake_amount.toString() + ", 'admin', '" + datetime + "', 'update_clam_miner', 'update_clam_miner') ;"
                connection.query(rake_user)
                let prevous_rake_amount = rows[0].clam_balance
                let current = prevous_rake_amount + (rake_amount * -1)
                connection.query('UPDATE user SET clam_balance = ? WHERE username = ?;', [current, 'rake_user'])
            })

        })

    })
    return res.send({ code: "success" })

})

app.listen(port, () => console.log(`App listening on port ${port}!`))