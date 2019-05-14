const crypto = require("crypto");




function encrypt_sha512(secret, str) {
    var hmac = crypto.createHmac("sha512", secret);
    var signed = hmac.update(str).digest("hex");
    return signed

}



function encrypt_sha384(secret, str){

  var hmac = crypto.createHmac("sha384", secret);
  var signed = hmac.update(str).digest("hex");
  return signed
  // const payload = new Buffer.from(JSON.stringify(str)).toString('base64');
  //
  // const signature = crypto
  //   .createHmac('sha384', secret)
  //   .update(payload)
  //   .digest('hex');
  //
  // return signature;
}

/**
 * Format number to two digits
 **/
function twoDigits(d) {
   if (0 <= d && d < 10) return "0" + d.toString();
   if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
   return d.toString();
}


module.exports = {
  twoDigits,
  encrypt_sha512,
  encrypt_sha384
}
