var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'actorcv2018@gmail.com',
    pass: 'tonderai'
  }
});


Mailer = {};

/**
 * Send emails
 */
 //TODO[Tadious]:Create templates, optimize process
Mailer.send = function comparePassword(options) {
  transport.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  }, function(err, responseStatus) {
    if (err) {
      console.log(">>>>>>>>>>>>>>>>>>>>>Mailer::send:err",err);
    } else {
      console.log(">>>>>>>>>>>>>>>>>>>>>Mailer::send:responseStatus",responseStatus);
    }
  });
};

module.exports = Mailer;