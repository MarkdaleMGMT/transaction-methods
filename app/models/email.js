const nodemailer = require("nodemailer");


var transporter = nodemailer.createTransport({
    host: "smtp.zoho.email",
    port: 465,
    secure: true, 
    auth: {
      user: "testaccount125@zoho.com", 
      pass: "markdale123!"
    }
  });

async function sendEmail(receiver, subject, text){
	let mailOptions = {
		from: '"Markdale Financial Management" <testaccount125@zoho.com', // sender address
		to: receiver, // list of receivers
		subject: "Confirm Email for Markdale Financial Management", // Subject line
		text: text // plain text body
		};

	transporter.sendMail(mailOptions, (error, info) => {
	            if (error) {
	                console.log(error);
	            } else {
	                console.log("successfully sent email!")
	            }
	        });

}
module.exports = {sendEmail}
