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
  Geolocation,
  newBeacon
) {
  Resources.init();
  $scope.searchResults = [];
  $scope.resources = [];
  $scope.newBeacon = newBeacon;

  Geolocation.get().then(function(loc){
    $scope.geoloco = loc;
    $scope.resources = Resources.all();
    // Resources.getFromLocation(loc); // temporarily disabled
  });

  // $scope.saveInfo = function(excursion) {
  //   console.log('saveinfo', excursion);
  // };

  $scope.saveBeacon = function() {
    UserBeacons.save(this.newBeacon)
      .then(function(data) {
        alert("do something after saving beacon")
      })
  };
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
    $scope.program = resource.program;
    $scope.description = resource.description;
    $scope.address = resource.address;
    $scope.phoneNumbers = resource.phone;
    $scope.hours = resource.hours;
    $scope.service_area = resource.service_area;
    $scope.eligibility = resource.eligibility;
    $scope.documents_required = resource.documents_required;
    $scope.volunteering = resource.volnteering;
    $scope.fax = resource.fax;

    var coord1 = Number(resource.coords[0]);
    var coord2 = Number(resource.coords[1]);

    var mapOptions = {
      zoom: 15,
      center: {lat: coord1, lng: coord2}
    };

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    new google.maps.Marker({
      // The below line is equivalent to writing:
      // position: new google.maps.LatLng(-34.397, 150.644)
      position: {lat: coord1, lng: coord2},
      map: map
    });

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
