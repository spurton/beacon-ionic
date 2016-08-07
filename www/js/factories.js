angular.module('starter.factories', [])
.factory("Resources", function (
  $firebaseRef,
  $firebaseObject,
  $q,
  auth,
  $firebaseArray
) {
  var geoFire = new GeoFire($firebaseRef.resourcesGeo);
  
  function init() {
    this.list = [];
    var list = this.list;
    var ref = listRef();
    
    if (ref) {
      this.index = $firebaseArray(ref);
      this.index.$watch(function(event) {
        if (event.event === 'child_added') {
          list.push(get(event.key, true)); // for live data
          get(event.key).then(addToList(list));
        }
      });
    }
  }

  function save(resource) {
    var q = $q.defer();

    if (userRef = usersBeacons()) {
      var ref = $firebaseRef.resources

      if (resource.locations.length > 0) {
        var data = angular.copy(resource);
        var firstLoc = data.locations[0];
        data.date = data.date.getTime();
        ref.push(data)
          .then(function(data){
            geoFire.set(data.key(), [firstLoc.lat, firstLoc.lng]);
            userRef.child(data.key()).set(true);
            q.resolve(data);
          })
          .catch(function(error){
            console.log("nope")
            q.reject(error);
          });
        } else {
          alert('Please Add a Location First!');
          q.reject('No Locations Mane!!!');
        }
    } else {
      alert('Please Login First');
      q.reject('You Aint Logged In!!!');
    }

    return q.promise;
  }

  function getFromLocation(loc) {
    var query = geoFire.query({
      center: [loc.lat, loc.lng],
      radius: 20
    });
    
    query.on("key_entered", addToList.bind(this));
  }

  // function addToList(key, location, distance) {
  //   var ref = $firebaseRef.resources.child(key)
  //   $firebaseObject(ref).$loaded()
  //   .then(function(obj){
  //     if (obj.name) { 
  //       this.list.push(obj); 
  //     } else {
  //       console.log('addToList, Record Doesnt Exist');
  //     }
  //   }.bind(this));
  // }

  function usersBeacons() {
    if (id = getFirebaseId()) {
      return $firebaseRef.users.child(id).child('resources');
    }
  }

  function getFirebaseId() {
    return auth.isAuthenticated ? auth.profile.fb_id : null;
  }

  function all() {
    return this.list;
  }

  function get(id, live) {
    var ref = $firebaseRef.resources.child(id);

    if (ref) {
      if (live) {
        return $firebaseObject(ref);
      } else {
        return ref.once('value');
      }
    }
  }

  function addToList(list) {
    return function(data){
      list.push({id: data.key(), value: data.val()});
    }
  }

  function listRef() {
    return $firebaseRef.resources;
  }

  return {
    init: init,
    getFromLocation: getFromLocation,
    get: get,
    all: all,
    save: save
  }
})



.factory("UserBeacons", function(
  $firebaseRef,
  $firebaseArray,
  $firebaseObject,
  $q,
  auth,
  Geolocation,
  WebTask
) {
  function save(beacon) {
    var q = $q.defer();

    if (userRef = usersBeacons()) {
      Geolocation.get().then(function(loc) {
        beacon.geoloco = loc;
        var email = beacon.email;
        var data = angular.copy(beacon);
        userRef.push(data)
          .then(function(data){
            // geoFire.set(data.key(), [firstLoc.lat, firstLoc.lng]); // not using
            var emails = {"emails": [email]} // note this needs to be a list of emails from the resources
            WebTask.run('https://webtask.it.auth0.com/api/run/wt-spurton-gmail_com-0/email_task?webtask_no_cache=1', emails);
            q.resolve(data);
          })
          .catch(function(error){
            console.log("nope")
            q.reject(error);
          });
      });
    } else {
      alert('Please Login First');
      q.reject('You Aint Logged In!!!');
    }

    return q.promise;
  }

  function usersBeacons() {
    if (id = getFirebaseId()) {
      return $firebaseRef.users.child(id).child('beacons');
    }
  }

  function getFirebaseId() {
    return auth.isAuthenticated ? auth.profile.user_id : null;
  }

  return {
    save: save
  };
})




.factory("Geolocation", function(store, $cordovaGeolocation, $q) {
  function getLocation() {
    var q = $q.defer();
  
    if (store.get('location')) {
      q.resolve(store.get('location'));
    } else {
      var that = this;

      this.query()
      .then(function(position) {
        q.resolve(that.set(position));
      })
    }

    return q.promise;
  }

  function setLocation(position) {
    var lat  = position.coords.latitude;
    var lng = position.coords.longitude;
    var coords = {lat: lat, lng: lng};

    store.set('location', coords);
    return coords;
  }

  function queryLocation() {
    var posOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    };

    return $cordovaGeolocation.getCurrentPosition(posOptions)
  }

  return {
    get: getLocation,
    set: setLocation,
    query: queryLocation
  };
})



/*
===========================================================================
  G O O G L E   M A P S
===========================================================================
*/
.factory('GoogleMapsService', ['$rootScope', '$ionicLoading', '$timeout', '$window', '$document', 'ConnectivityService', 'store', function($rootScope, $ionicLoading, $timeout, $window, $document, ConnectivityService, store){
  var apiKey = false,
  map = null,
  mapDiv = null,
  directionsService,
  directionsDisplay,
  routeResponse;
  var loc = store.get('location');
 
  function initService(mapEl, key) {
    mapDiv = mapEl;
    if (typeof key !== "undefined") {
      apiKey = key;
    }
    if (typeof google == "undefined" || typeof google.maps == "undefined") {
      disableMap();
      if (ConnectivityService.isOnline()) {
        $timeout(function() {
          loadGoogleMaps();
        },0);
      }
    } else {
      if (ConnectivityService.isOnline()) {
        initMap();
        enableMap();
      } else {
        disableMap();
      }
    }
  }
 
  function initMap() {
    if (mapDiv) {
      var mapOptions = {
        center: [loc.lat, loc.lng],
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
      };

      map = new google.maps.Map(mapDiv, mapOptions);
      directionsService = new google.maps.DirectionsService();
      directionsDisplay = new google.maps.DirectionsRenderer();
      directionsDisplay.setMap(map);
      // Wait until the map is loaded
      google.maps.event.addListenerOnce(map, 'idle', function(){
        enableMap();
      });
    }
  }
 
  function enableMap() {
    // For demonstration purposes we’ll use a $rootScope variable to enable/disable the map.
    // However, an alternative option would be to broadcast an event and handle it in the controller.
    $rootScope.enableMap = true;
  }
 
  function disableMap() {
    $rootScope.enableMap = false;
  }
 
  function loadGoogleMaps() {
    // This function will be called once the SDK has been loaded
    $window.mapInit = function() {
      initMap();
    };
 
    // Create a script element to insert into the page
    var script = $document[0].createElement("script");
    script.type = "text/javascript";
    script.id = "googleMaps";
 
    // Note the callback function in the URL is the one we created above
    if (apiKey) {
      script.src = 'https://maps.google.com/maps/api/js?key=' + apiKey + '&sensor=true&callback=mapInit';
    } else {
      script.src = 'https://maps.google.com/maps/api/js?sensor=true&callback=mapInit';
    }
    $document[0].body.appendChild(script);
  }
 
  function checkLoaded() {
    if (typeof google == "undefined" || typeof google.maps == "undefined") {
      $timeout(function() {
        loadGoogleMaps();
      },2000);
    } else {
      enableMap();
    }
  }
 
  function addRoute(origin, destination, waypts, optimizeWaypts) {
    routeResponse = null;
    if (typeof google !== "undefined") {
      var routeRequest = {
        origin : origin,
        destination : destination,
        waypoints: waypts,
        optimizeWaypoints: optimizeWaypts,
        travelMode : google.maps.TravelMode.WALKING
      };
 
      directionsService.route(routeRequest, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
          google.maps.event.trigger(map, 'resize');
          // Save the response so we access it from controller
          routeResponse = response;
          // Broadcast event so controller can process the route response
          $rootScope.$broadcast('googleRouteCallbackComplete');
        }
      });
    }
  }
 
  function removeRoute() {
    if (typeof google !== "undefined" && typeof directionsDisplay !== "undefined") {
      directionsDisplay.setMap(null);
      directionsDisplay = null;
      directionsDisplay = new google.maps.DirectionsRenderer();
      directionsDisplay.setMap(map);
    }
  }

  
 
  return {
    initService: function(mapEl, key){
      initService(mapEl, key);
    },
    checkLoaded: function(){
      checkLoaded();
    },
    disableMap: function(){
      disableMap();
    },
    removeRoute: function(){
      removeRoute();
    },
    getRouteResponse: function(){
      return routeResponse;
    },
    addRoute: function(origin, destination, waypts, optimizeWaypts){
      addRoute(origin, destination, waypts, optimizeWaypts);
    }
  };
 
}])

.factory('GooglePlacesService', [function($scope) {

  var map = null;

  function init(lat,lng) {
    var center = new google.maps.LatLng(lat,lng);

    map = new google.maps.Map(document.getElementById('location_map'), {
      center: center,
      zoom: 15
    });
  }

  function getDetails(placeId, callback) {
    var request = {
      placeId: placeId
    };

    service = new google.maps.places.PlacesService(map);
    service.getDetails(request, callback);
  }

  return {
    init: init,
    getDetails: getDetails
  }
}])
 
/*
===========================================================================
  C O N N E C T I V I T Y
===========================================================================
*/
.factory('ConnectivityService', [function(){
  return {
    isOnline: function(){
      var status = localStorage.getItem('networkStatus');
      if (status === null || status == "online") {
        return true;
      } else {
        return false;
      }
    }
  };
}])
/*
===========================================================================
  N E T W O R K
===========================================================================
*/
.factory('NetworkService', ['GoogleMapsService', function(GoogleMapsService){
/*
 * handles network events (online/offline)
 */
  return {
    networkEvent: function(status){
      var pastStatus = localStorage.getItem('networkStatus');
      if (status == "online" && pastStatus != status) {
        // The app has regained connectivity...
        GoogleMapsService.checkLoaded();
      }
      if (status == "offline" && pastStatus != status) {
        // The app has lost connectivity...
        GoogleMapsService.disableMap();
      }
      localStorage.setItem('networkStatus', status);
      return true;
    }
  };
}])



 // YELP
.factory('Yelp', ['$http', function($http){
  // TODO: We need to use our own here.
  var auth = {
    consumerKey: "CczkBNRj_eaoMgqd0o4n1A",
    consumerSecret: "jfMHfpHubGUZWRBXVAjTaTMRrbo",
    accessToken: "0IKGCVVzoRIpB2WKQtFPYa_stRAlzmYO",
    accessTokenSecret: "JEoYIbjq2NJkywPo7HBu_pG4GgE",
    serviceProvider: {
      signatureMethod: "HMAC-SHA1"
    }
  };

  var method = 'GET';
  var url = 'http://api.yelp.com/v2/search';

  var params = {
    callback: 'angular.callbacks._0',
    oauth_consumer_key: 'CczkBNRj_eaoMgqd0o4n1A', //Consumer Key
    oauth_token: '0IKGCVVzoRIpB2WKQtFPYa_stRAlzmYO', //Token
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: new Date().getTime(),
    oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
  };

  var consumerSecret = 'jfMHfpHubGUZWRBXVAjTaTMRrbo'; //Consumer Secret
  var tokenSecret = 'JEoYIbjq2NJkywPo7HBu_pG4GgE'; //Token Secret
  var signature = oauthSignature.generate(method, url, params, consumerSecret, tokenSecret, { encodeSignature: false});
  params['oauth_signature'] = signature;

  function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  }

  function getBusinesses(lat, lng) {
    params.cll = {
      latitude: lat,
      longitude: lng
    }

    $http.jsonp(url, {params: params}).success(function(data) {
      console.log(data);
      return data;
    });
  }

  return {
    getBusiness: getBusinesses
  }
}])



.factory('WebTask', ['$http', function($http) {
  function run(endPoint, payload) {
    $http.post(endPoint, payload, {})
    .then(function(response){ 
      debugger;
      response.data; 
    });
  }
  

  return {
    run: run
  }
}]);
