const mysql = require('mysql')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000 

// allow POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
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
 * You first need to create a formatting function to pad numbers to two digits…
 **/
function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}
/**
 * …and then create the method to output the date string as desired.
 * Some people hate using prototypes this way, but if you are going
 * to apply this to more than one Date object, having it as a prototype
 * makes sense.
 **/
Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

const database_pass = {
        host: '165.227.35.11',
        user: 'user',
        password: 'Zh8gqQhSK9meM7uu',
        database: 'dev',
        multipleStatements: true
    }

app.post('/deposit', (req, res) => {
    let username = req.body.username
    let amount = req.body.amount
    let credit_amount = amount * -1
    let datetime = new Date().toMysqlFormat()
    console.log('in transaction')
    const connection = mysql.createConnection(database_pass);
    let debit_query = "INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('clam_mine', 'debit', " + amount.toString() + ", 'admin', '" + datetime + "', 'deposit', 'deposit') ;"
    let credit_query = " INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('" + username +"', 'credit', " + credit_amount.toString() + ", 'admin', '" + datetime + "', 'deposit', 'deposit') ;"
    connection.query(debit_query + credit_query, function(err, rows, fields) {
        if (err){
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
 * @param  {string} username     Username 
 * @param  {int} amount    [description]
 * @param  {[type]} fields) {                   if (err){        console.log(err)    	}        if (rows[0] ! [description]
 * @return {[type]}         [description]
 */
app.post('/withdrawal', (req, res) => {
    let username = req.body.username
    let amount = req.body.amount
    let credit_amount = amount * -1
    let datetime = new Date().toMysqlFormat()
    console.log('in transaction')
    const connection = mysql.createConnection(database_pass);
    let debit_query = "INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('" + username +"', 'debit', " + amount.toString() + ", 'admin', '" + datetime + "', 'withdrawal', 'withdrawal') ;"
    let credit_query = " INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('clam_mine', 'credit', " + credit_amount.toString() + ", 'admin', '" + datetime + "', 'withdrawal', 'withdrawal') ;"
    connection.query(debit_query + credit_query, function(err, rows, fields) {
        if (err){
        console.log(err)
    	}
        if (rows[0] != null && rows[0].solution != undefined) {
            console.log('The solution is: ', rows[0].solution)
        }
    })
    return res.send({ code: "success" })


})

app.post('/update', (req, res) => {
	let amount = req.body.amount
	let datetime = new Date().toMysqlFormat()
	const connection = mysql.createConnection(database_pass);
	connection.query("SELECT * FROM control;", function(err, rows, fields) {
		let original = rows[0].clam_miner_balance
		let change = amount - original
		console.log('in control')
		console.log('change', change)
		let rake_share = rows[0].clam_miner_rake
		let debit_query = "INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('clam_miner', 'debit', " + change.toString() + ", 'admin', '" + datetime + "', 'update_clam_miner', 'update_clam_miner') ;"
		connection.query(debit_query)
		console.log('updated transaction table clam miner debit')
		connection.query('UPDATE control SET clam_miner_balance = ?;', [amount])
		console.log('updated control table clam miner balance')
		let rake_amount = (rake_share*change)*-1
		connection.query("SELECT * FROM user WHERE username = 'rake_user';", function(err, rows, fields){
			let prevous_rake_amount = rows[0].clam_balance
			let current = prevous_rake_amount + (rake_amount*-1)
			connection.query('UPDATE user SET clam_balance = ? WHERE username = ?;', [current, 'rake_user']).then(()=>{
				let rake_user = "INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('rake_user', 'credit', " + rake_amount.toString() + ", 'admin', '" + datetime + "', 'update_clam_miner', 'update_clam_miner') ;"
				connection.query(rake_user)
				console.log('insert credit rake user')
				connection.query("SELECT * FROM user;", function(err, rows, fields){
					console.log('update individual user')
					console.log('rows', rows)
					if(err){
						console.log('errors', err)
					}
					for(let i =0; i<rows.length; i++){
						let row = rows[i]
						let id = row.id
						let previous_balance = row.clam_balance
						let previous_share = row.clam_balance/original
						let new_balance = previous_balance + (change*previous_share) - (rake_share*change*previous_share)
						let user_balance_change = (new_balance - previous_balance) * -1
						console.log('new_balance', new_balance)
						connection.query('UPDATE user SET clam_balance = ? WHERE id = ?;', [new_balance, id])
						let credit_query = "INSERT INTO transaction(username, credit_debit, amount, created_by,time, transaction_type, memo) VALUES ('" + row.username + "', 'credit', " + user_balance_change.toString() + ", 'admin', '" + datetime + "', 'update_clam_miner', 'update_clam_miner') ;"
						connection.query(credit_query)

					}
				

				})

			})

		})
		
	})
	return res.send({ code: "success" })

})

app.listen(port, () => console.log(`App listening on port ${port}!`))
