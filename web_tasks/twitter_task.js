//"curl -H "Content-Type: application/json" -d '{"user": "krisko","tweet": "This is my message again."}' -X POST -s https://webtask.it.auth0.com/api/run/wt-krisko643-gmail_com-0/twitter_task?webtask_no_cache=1"

var Twit = require('twit');

var T = new Twit({
  //consumer_key:         'f2kKrABQUHXSAyj1yEXDbIg5e',
  //consumer_secret:      'z0Jzfu0yCyfDjuxiRqmzOqAglWCWwFYJzFxUEHim7PjsgTXBFS',
  //Use your own auth
  app_only_auth: 'true'
});

module.exports = function (context, callback) {

  callback(null, (tweet(context.data)));
};

function tweet(d){
  var msg = d.tweet;

  T.post('statuses/update', { status: msg }, function(err, data, response) {
    console.log(data);
  });
}
