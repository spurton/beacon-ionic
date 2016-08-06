//"curl -H "Content-Type: application/json" -d '{"emails": ["christochris@sbcglobal.net","krisko643@gmail.com"]}' -X POST -s https://webtask.it.auth0.com/api/run/wt-krisko643-gmail_com-0/email_task?webtask_no_cache=1"


var nodemailer = require('nodemailer');

module.exports = function (context, callback) {

  callback(null, (parsePayload(context.data)));
};

function sendEmails(emails){
  var transporter = nodemailer.createTransport('smtps://krisko643%40gmail.com:t0r1o2M8@smtp.gmail.com');

// setup e-mail data with unicode symbols
  var mailOptions = {
      from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
      to: emails.toString(), // list of receivers
      subject: 'Hello ✔', // Subject line
      text: 'Hello world 🐴', // plaintext body
      html: '<b>Hello world 🐴</b>' // html body
  };



// send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    });
}

function parsePayload(data){
  var obj = data;
  console.log(data);
  //return obj.emails[1];

  return sendEmails(obj.emails);
  //return JSON.stringify(obj);
  //sendEmails(obj.emails);
}
