"use latest";

const child_process = require('child_process');
const twilio = require('twilio');

module.exports = (context, cb) => {
  if (context.body
      && context.body.access_token
      && context.body.excursion_id
      && context.body.attendees && context.body.attendees.constructor === Array) {
    

    authenticateSender(context.body.access_token)
      .then(sender => {
        context.body.attendees.map(attendee => {
          attendee.methods.map(method => {
            if (method.type === 'email') {
              sendEmail(sender, context.body.excursion_id, method.value)
            } else if (method.type === 'phone') {
              sendSms(sender, context.body.excursion_id, method.value, context.secrets)
            }
          });
        });

        cb(null, 'Sent Invites')
      })
      .catch(function(err){ 
        console.log('Request Failed', err);

        cb(null, `Invalid Request: ${err}`);
      });
  } else {
    cb(null, 'Invalid Request');
  }
};

function authenticateSender(access_token) {
  const curl_command = `curl https://foray.auth0.com/userinfo \
    --header 'Authorization:Bearer ${access_token}'`;

  return new Promise((resolve, reject) => {
    child_process.exec(curl_command, (errors, stdout, stderr) => {
      if (errors || stdout == 'Unauthorized') {
        reject(errors || stdout);
      } else {
        const sender = JSON.parse(stdout);
        resolve(sender);
      }
    });
  });
}

function sendSms(sender, excursion_id, to_number, env) {
  const client = new twilio.RestClient(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  client.sms.messages.post({
      body: `[Foray] ${sender.name} - has invited you to go on an excursion with them! ${excursion_id}`,
      to: to_number,
      from: env.TWILIO_NUMBER
  }, function(err, text) {
      err ? console.log(`There was an error on ${to_number}: ${err}`) 
          : console.log(`Sent Message to ${to_number}`);
  });
}

function sendEmail(sender, excursion_id, email) {
  console.log(generateEmailTemplate(sender));
}

function generateEmailTemplate(sender) {
  console.log('generate email template');

  return `SentEmail from ${sender.email}`;
}