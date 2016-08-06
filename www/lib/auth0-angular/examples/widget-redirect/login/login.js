angular.module( 'sample')
.controller( 'LoginCtrl', function ( $scope, auth, $rootScope) {

  $scope.auth = auth;

});
