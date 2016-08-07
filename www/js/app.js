// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic',
  'starter.controllers',
  'starter.factories',
  'beacon',
  'contacts-loader',
  'LocalStorageModule',
  'ngCordova',
  'auth0',
  'angular-storage',
  'angular-jwt',
  'firebase',
  'ion-google-place',
  'monospaced.elastic'
])
.constant('FirebaseUrl', 'https://beacon-db.firebaseio.com/')
.constant('Auth0Settings', {
  icon: '',
  primaryColor: '#242A34',
  closable: false,
  authParams: {
    scope: 'openid offline_access',
    device: 'Mobile device'
  }
})
.run(function(
  $ionicPlatform,
  $rootScope,
  $location,
  $firebaseAuthService,
  $firebaseObject,
  $firebaseRef,
  auth,
  store,
  jwtHelper,
  Geolocation
) {
  $ionicPlatform.ready(function() {
    // $ionicPlatform Ready Can only be called once
    // extract this into a service if you need it
    // in more than one place
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // Geolocation.get();
  });


  // Auth
  auth.hookEvents();
  $rootScope.$on('$locationChangeStart', function() {
    if (!auth.isAuthenticated) {
      var token = store.get('token');
      if (token) {
        console.log('token', auth.idToken)
        if (!jwtHelper.isTokenExpired(token)) {
          auth.authenticate(store.get('profile'), token).then(refreshFirebaseAuth)
        } else {
          // Use the refresh token we had
          var refreshToken = store.get('refreshToken');
          if (refreshToken) {
            auth.refreshIdToken(refreshToken).then(function(idToken) {
              store.set('token', idToken);
              auth.authenticate(store.get('profile'), token).then(refreshFirebaseAuth);
            });
          } else {
            console.log('redirect to unauthed area');
          }
        }
      }
    }
  });

  function refreshFirebaseAuth(profile) {
    console.log('refreshFirebaseAuth', profile);
  };

  $firebaseAuthService.$onAuth(function (user) {
    // console.log('firebase_id', user.auth.fb_id);
    // console.log('store', store.get('profile'))
    // var user = $firebaseObject($firebaseRef.default.child('users').child(auth.profile.fb_id))

    // user.profile = auth.profile;
    // user.$save().then(function () {
    //   console.log('saved user')
    // }).catch(function(error) {
    //   console.error('usernotesaved', error)
    // })
  })
})

.config(function(
  $stateProvider,
  $urlRouterProvider,
  $firebaseRefProvider,
  FirebaseUrl,
  authProvider
) {
  $firebaseRefProvider.registerUrl({
    default: FirebaseUrl,
    users: FirebaseUrl + '/users',
    resources: FirebaseUrl + '/resources',
    categories: FirebaseUrl + '/categories',
    resourcesGeo: FirebaseUrl + '/resources-geo'
  });

  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })
  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })
  .state('app.resources', {
    url: '/resources',
    views: {
      'menuContent': {
        templateUrl: 'templates/resources.html',
        controller: 'ResourcesCtrl'
      }
    },
    resolve: {
      newBeacon: function() {
        return {
          needs: [],
          date: Date.now()
        }
      }
    }
  })
  .state('app.resource', {
    url: '/resources/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/resource.html',
        controller: 'ResourceCtrl'
      }
    }
  })
  .state('app.location', {
    url: '/location/:placeId/:lat/:lng',
    views: {
      'menuContent': {
        templateUrl: 'templates/location.html',
        controller: 'LocationCtrl'
      }
    }
  })
  .state('app.beacon-new', {
    url: '/beacons-new',
    views: {
      'menuContent': {
        templateUrl: 'templates/beacon-edit.html',
        controller: 'BeaconNewCtrl'
      }
    },
    resolve: {
      newBeacon: function() {
        return {
          needs: [],
          date: Date.now
        }
      }
    },
    data: { requiresLogin: false }
  })
  .state('app.authedRoute', {
    url: '/authedRoute',
    views: {
      'menuContent': {
        templateUrl: 'templates/resources.html',
        controller: 'ResourcesCtrl'
      }
    },
    data: { requiresLogin: true }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/resources');

  authProvider.init({
    domain: 'beacon-ionic.auth0.com',
    clientID: 'IOHSkaeENWIRgfnh52vo4xXc2QS5rr8O',
    loginState: 'app.login'
  });
}).filter('inArray', function($filter){
    return function(list, arrayFilter, element){
      if(arrayFilter){
        return $filter("filter")(list, function(listItem){
          if (arrayFilter === 'none') return true;

          return listItem[element].indexOf(arrayFilter) != -1;
        });
      }
    };
  });
