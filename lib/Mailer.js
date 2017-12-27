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

/**
 * Send emails
 */
 //TODO[Tadious]:Create templates, optimize process
/*Mailer.send = function sendEmail(options) {
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
};*/


Mailer.send = function sendEmail(email, templateName, variables) {
  // create template based sender function
  // assumes text.{ext} and html.{ext} in template/directory
  var templatesDir = path.resolve(__dirname, 'templates/emails/'+templateName);
  console.log(">>>>>>>>>>>templatesDir", templatesDir);
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