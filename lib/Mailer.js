var EmailTemplate = require('email-templates').EmailTemplate;
var path = require('path');
var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'actorcv2018@gmail.com',
    pass: 'tonderai'
  }
});


Mailer = {};

Mailer.send = function sendEmail(email, templateName, variables) {
  var templatesDir = path.resolve(__dirname, 'templates/emails/'+templateName);
  var emailTemplateFunction = transport.templateSender(
    new EmailTemplate(templatesDir), {
        from: 'ActorCV <no-reply@actorcv.me>',
    });

  emailTemplateFunction({
    to: email
    }, 
    variables, 
    function (err, info) {
      if (err) {
        console.log(err)
      } else {
        console.log('Email sent\n' + JSON.stringify(info));
      }
  });
};



module.exports = Mailer;