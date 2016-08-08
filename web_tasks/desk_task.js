/**

  Webtask to create Desk.com customers and cases from Beacon JSON payload

  #############################
  # INSTALLATION INSTRUCTIONS #
  #############################

  1. Install the webtask cli: `npm install -g wt-cli`
  2. Create a webtask profile: `wt init`
  3. Create a Desk.com API application under
     https://YOURSUBDOMAIN.desk.com/admin/settings/api-applications
  4. Generate the webhook url using the secrets from the API application you
     just created, e.g.,
  
     wt create --name desk_task \
       --secret SUBDOMAIN="https://YOUR_SUBDOMAIN.desk.com" 
       --secret USER="" \
       --secret PASS=""

  #####################
  # EXAMPLE CURL CALL #
  #####################

  curl localhost:8080 \
  -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Chewbacca",
       "last_name": "GarrrGhhgh",
       "email_address": "garaghagggggg@wookiezrule.com",
       "primary_phone": "123-456-7890",
       "secondary_phone": "098-765-4321",
       "needs": ["Clothing", "Financial", "Transportation"],
       "notes": "I need help please, thank you."}'
 */


var unirest = require('unirest');
var Q       = require('q');

module.exports = function (context, cb) {
  var auth = context.secrets;
  var data = context.body
  data.email_address = data
                         .email_address
                         .trim()
                         .toLowerCase();

	cb(null, pushToDesk(auth, data));
}

/*
  data example
 
  {"first_name": "Chewbacca",
   "last_name": "GarrrGhhgh",
   "email_address": "garaghagggggg@wookiezrule.com",
   "primary_phone": "123-456-7890",
   "secondary_phone": "098-765-4321",
   "needs": ["Clothing", "Financial", "Transportation"],
   "notes": "I need help please, thank you."}
 
  eventually would make sense for needs to be an array of objects so we can
  add additional metadata around the need, e.g., 

    "needs": [{type:     "clothing",
               notes:    "it's cold and i haz no jacket",
               priority: "urgent"},
              {type:     "food",
               notes:    "I'm sick of eating rations",
               priority: "kindasorta"}]
*/

function pushToDesk(auth,data) {
  findOrCreateCustomer(auth,data)
    .then(function (customer) {
      createCases(auth, data, customer)
    })
}

function findOrCreateCustomer(auth, data) {
  var deferred = Q.defer();

  var path = (auth.ENDPOINT + "/api/v2/customers/search?q=" + data.email_address);

  unirest
    .get(path)
    .auth({user: auth.USER, pass: auth.PASS})
    .end(function(response) {

      var customer;
      var results = response.body._embedded.entries;

      if (results.length > 0 ) {
        // match customer
        customer = matchCustomerToResults(data, results);
        
        // create customer if no match
        if (customer == undefined) {
          customer = createCustomer(auth, data);
        }

      } else {
        // create customer
        customer = createCustomer(auth, data);
      }

      deferred.resolve(customer);

    })

  return deferred.promise;
}

function matchCustomerToResults (data, results) {
  var customer; 
  
  // iterate over each result and attempt to match
  for (var i = results.length - 1; i >= 0; i--) {
    var result = results[i];
    if (matchCustomerToResult(data, result)) {
      // if customer & result match, break & return
      customer = result;
      break;
    }
  }

  return customer;
}

function matchCustomerToResult(data, result) {
  var match = false;

  // iterate over each email address to find match
  for (var i = result.emails.length - 1; i >= 0; i--) {
    var customer_email = result
                           .emails[i]
                           .value
                           .trim()
                           .toLowerCase()

    if (customer_email == data.email_address) {
      // if customer matches by email, confirm match & break
      var match = true;
      break;
    }
  }

  return match;
}

function createCustomer (auth, data) {

  var deferred = Q.defer();
  var customer;
  var post_data = {
      first_name: data.first_name,
      last_name:  data.last_name
    }

  post_data.emails = []
  post_data.emails.push({type: 'home', value: data.email_address})

  post_data.phones = []
  if (data.primary_phone != undefined && data.primary_phone.length > 0) {
    post_data.phones.push({type: 'home', value: data.primary_phone});
  }

  if (data.secondary_phone != undefined && data.secondary_phone.length > 0) {
    post_data.phones.push({type: 'home', value: data.secondary_phone});
  }

  unirest
    .post(auth.ENDPOINT + '/api/v2/customers')
    .headers({'Accept': 'application/json',
      'Content-Type': 'application/json'})
    .auth({user: auth.USER, pass: auth.PASS})
    .send(post_data)
    .end(function(response) {
      deferred.resolve(response.body)
    })

  return deferred.promise;;
}

function createCases(auth, data, customer) {
  var deferred = Q.defer();

  for (var i = data.needs.length - 1; i >= 0; i--) {
    var need = data.needs[i];
    createCase(auth, data, customer, need);
  }

  deferred.resolve();

  return deferred.promise;
}

function createCase(auth, data, customer, need) {
  var url = (auth.ENDPOINT + customer._links.self.href + '/cases')
  var post_data = buildCasePostData(data, need);
  console.log(url, post_data)

  unirest
    .post(url)
    .headers({'Accept': 'application/json',
      'Content-Type': 'application/json'})
    .auth({user: auth.USER, pass: auth.PASS})
    .send(post_data)
    .end(function(response) {
      console.log(response.statusCode, response.statusMessage, response.body)
    })
}

function buildCasePostData(data, need) {
  var post_data = {
    'subject':      (need + " Resource Request"),
    'labels':       [need],
    'label_action': 'append',
    'type':         'email',
    'message':      {
      'subject':   (need + "Resource Request"),
      'to':        data.email_address,
      'direction': 'in',
      'status':    'sent',
      'body':      data.notes
    }
  }

  return post_data
}
