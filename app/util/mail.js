let nodemailer = require("nodemailer");
const util = require('util');

let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "COMPANYEMAIL@gmail.com",
        pass: "userpass"
      }
});

const send_email = util.promisify(transporter.sendMail);

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
