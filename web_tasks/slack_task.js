//"curl -H "Content-Type: application/json" -d '{"text": "This is my message."}' -X POST -s https://webtask.it.auth0.com/api/run/wt-krisko643-gmail_com-0/slack_task?webtask_no_cache=1"


var MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

module.exports = function (context, callback) {

  callback(null, (sendMsg(context.data)));
};

function sendMsg(data){
  slack.send({
    channel: '#beacon',
    text: data.text,
    username: 'Beacon App'
  });
}
