angular.module('starter.controllers', [])

.controller('AppCtrl', function(
  $scope,
  $ionicModal,
  $timeout,
  $state,
  $firebaseAuthService,
  Auth0Settings,
  auth,
  store
) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $firebaseAuthService.$onAuth(function (user) {
    $scope.isAuthenticated = auth.isAuthenticated;
  });

  // Open the login modal
  $scope.login = function() {
    Auth0Settings.closable = true;
    auth.signin(Auth0Settings, loginCallback($state, store, auth, $firebaseAuthService), loginCallbackError);
  };

  $scope.logout = function() {
    auth.signout();
    store.remove('token');
    store.remove('profile');
    store.remove('refreshToken');
    store.remove('firebaseToken');
    alert('You Successfully Logged Out'); // turn into ionic popup
    window.reload(); // refresh the app
  };
})

.controller('ResourcesCtrl', function(
  $scope,
  $firebaseRef,
  $firebaseArray,
  Resources,
  Geolocation
) {
  Resources.init();
  $scope.searchResults = [];
  $scope.resources = [];

  Geolocation.get().then(function(loc){
    $scope.geoloco = loc;
    $scope.resources = Resources.all();
    // Resources.getFromLocation(loc); // temporarily disabled
  });
})

.controller('ResourceCtrl', function(
  $scope,
  $stateParams,
  Resources,
  GoogleMapsService,
  $rootScope
) {
  GoogleMapsService.initService(document.getElementById("map"));

  $scope.resource = Resources.get($stateParams.id, true);

  $scope.resource.$loaded().then(function(resource) {
    console.log(resource);
    var waypts = [];

    var locations = $scope.resource.locations;

    angular.forEach(locations, function(location) {
      var latLng = new google.maps.LatLng(location.lat, location.lng);
      waypts.push({
        location: latLng,
        stopover: true
      });
    });

    var firstLocation = locations[0];
    var lastLocation = locations[locations.length - 1];
    var origin = new google.maps.LatLng(firstLocation.lat, firstLocation.lng);
    var destination = new google.maps.LatLng(lastLocation.lat, lastLocation.lng);
    GoogleMapsService.addRoute(origin, destination, waypts, true);
  });

})

.controller('LocationCtrl', function(
  $scope,
  $stateParams,
  GooglePlacesService,
  $ionicSlideBoxDelegate
) {
  GooglePlacesService.init($stateParams.lat, $stateParams.lng);

  GooglePlacesService.getDetails($stateParams.placeId, function(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      $scope.place = place;
      $scope.photos = place.photos.map(function(photo){
        return photo.getUrl({'maxWidth': 400, 'maxHeight': 400});
      })
      calculateRating(place.rating);
      $scope.hasHours = ('opening_hours' in place);
      console.log(place);
    }
  });

  function calculateRating(value) {
    $scope.stars = [];
    value = Math.round(value);
    for (var i = 0; i < 5; i++) {
      $scope.stars.push({
        filled: i < value
      });
    }
  };
})

.controller('BeaconNewCtrl', function(
  $scope,
  Excursions,
  newExcursion
) {
  $scope.newExcursion = newExcursion;
  $scope.newExcursion.attendees = [];

  $scope.reorderLocation = function(location, $fromIndex, $toIndex) {
    location.pos = $toIndex;
  };

  $scope.saveInfo = function(excursion) {
    console.log('saveinfo', excursion);
  };

  $scope.saveExcursion = function() {
    Excursions.save(this.newExcursion)
      .then(function(data) {
        alert("do something after saving excursion")
      })
  };
})

.controller('LoginCtrl', function($state ,$firebaseAuthService, Auth0Settings, auth, store) {
  auth.signin(Auth0Settings, loginCallback($state, store, auth, $firebaseAuthService), loginCallbackError);
});

function loginCallbackError(error) {
  console.error('Auth0Login', error);
}

function loginCallback($state, store, auth, $firebaseAuthService) {

  return function(profile, id_token, accessToken, state, refreshToken) {
    store.set('profile', profile);
    store.set('token', id_token);
    store.set('accessToken', accessToken);
    store.set('refreshToken', refreshToken);
    auth.getToken({
      api: 'firebase'
    }).then(function(delegation) {
      store.set('firebaseToken', delegation.id_token);

      $firebaseAuthService.$authWithCustomToken(delegation.id_token)
        .then(function (auth) {
          $state.go('app.excursions');
        })
        .catch(function (error) {
          alert('LoginError');
          console.error('firebaseauth', error);
        })
    }, function(error) {
      console.error('Firebase Token', error);
    })
  };
}
