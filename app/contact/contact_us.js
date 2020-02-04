const { send_email } = require('../util/mail')
const { mysql_config , db_backup} = require('../../config')

module.exports = async function create_account(req, res) {

    let user_email =  req.body.email
    let user_subject  = req.body.subject
    let user_body = req.body.body

    try{
        //send an email to db_backup about the contact form
        let text = create_text(user_email, user_subject, user_body)
        let to_admin = await send_email(db_backup.email, `[Contact] [${user_email}] ${user_subject}`, text, null);
        console.log("email_admin result: ", to_admin);
        
        //send an email to the user that their email has been recieved
        text = `This is an email to confirm that we have received your message. A member from our team will contact you soon regarding your concern!\n`
        let to_user = await send_email(user_email, `[Do Not Reply] We have recieved your message!`, text, null);
        console.log("email_user result: ", to_user);

        res.send({ code: "Our team has been notified! We'll get back to you soon"})
    } catch (err) {
        res.status(400).send({code:"Something went wrong with sending the mail" , message:err.message})
    }
    
  };

function create_text(email, subject, body){
    return (`
        Email: ${email}\n
        Subject: ${subject}\n
        Body: ${body}`
        )

}