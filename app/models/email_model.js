const nodemailer = require("nodemailer");


var transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true, 
    auth: {
      user: "testaccount125@zoho.com", 
      pass: "markdale123!"
    }
  });

async function send_email(receiver, text){
	let mailOptions = {
		from: '"Carlson Lau" <testaccount125@zoho.com>', // sender address
		to: receiver, // list of receivers
		subject: "Confirm Email for Markdale Financial Management", // Subject line
		text: text // plain text body
		};

	transporter.sendMail(mailOptions, (error, info) => {
	            if (error) {
	                console.log("send email error", error);
	            } else {
	                console.log("successfully sent email!")
	            }
	        });
	return 
}
module.exports = {send_email}
