const { send_email } = require('../util/mail')
const { mysql_config , db_backup} = require('../../config')

module.exports = async function create_account(req, res) {

    let user_email =  req.body.email
    let user_subject  = req.body.subject
    let user_body = req.body.body

    try{
        let text = create_text(user_email, user_subject, user_body)
        let to_admin = await send_email(db_backup.email, `[Contact] [${user_email}] ${user_subject}`, text, null);
        console.log("email result: ", to_admin);
        res.send("Success")
    } catch (err) {
        res.send(err)
    }
    //send an email to the user that their email has been recieved
    

    //send an email to db_backup about the contact form

  
 
  };

function create_text(email, subject, body){
    return (`
        Email: ${email}\n
        Subject: ${subject}\n
        Body: ${body}`
        )

}