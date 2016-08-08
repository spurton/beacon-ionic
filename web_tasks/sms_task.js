var request = require('request');
// Webtask.io Github service wraps standard webtask and only provides context and callback.
// context.data has secret params
// context.req has the initial node.js request (the Github webhook)
// context.body has the body object from the request    
return function (context, callback) {
    var repo = ((context.webhook || {}).repository) || {};  
    request({ 
        url: 'https://api.twilio.com/2010-04-01/Accounts/' + context.data.TWILIO_ACCOUNT_SID + '/Messages', 
        method: 'POST',
        auth: {
            user: context.data.TWILIO_ACCOUNT_SID,
            pass: context.data.TWILIO_AUTH_TOKEN
        },
        form: {
            From: context.data.TWILIO_NUMBER,
            To: '+16619102156',
            Body: 'I need the following resources:`' + repo.full_name + '`'
        }
    }, function (error, res, body) {
        callback(error, body);
    });
}
