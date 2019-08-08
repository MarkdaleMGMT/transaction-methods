let nodemailer = require("nodemailer");
const util = require('util');
const { mail_config } = require('../config')

let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "COMPANYEMAIL@gmail.com",
        pass: "userpass"
      }
});

const sendMailAsync = util.promisify(transporter.sendMail);


async function send_email(recipients, subject, text, attachments){

  let mailOptions = {
		from: mail_config.sender, // sender address
		to: recipients, // list of receivers
		subject: subject, // Subject line
		text: text, // plain text body
    attachments: attachments
		};

  try{
    let result = await sendMailAsync(mailOptions);
    return result;
  }catch(err){
    console.error(err);
    throw new Error("Failed to send email ",err.message);
  }

}

module.exports = {
  send_email
};


// create mail transporter


// let mailOptions = {
//         from: "COMPANYEMAIL@gmail.com",
//         to: "sampleuser@gmail.com",
//         subject: `Not a GDPR update ;)`,
//         text: `Hi there, this email was automatically sent by us`
//       };
//       transporter.sendMail(mailOptions, function(error, info) {
//         if (error) {
//           throw error;
//         } else {
//           console.log("Email successfully sent!");
//         }
//       });
