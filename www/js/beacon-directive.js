angular.module('beacon', [])
.directive('beaconModal', [
  '$ionicLoading',
  '$ionicModal',
  '$ionicSlideBoxDelegate',
  '$ionicPopup',
  '$state',
  '$timeout',
  function(
    $ionicLoading,
    $ionicModal,
    $ionicSlideBoxDelegate,
    $ionicPopup,
    $state,
    $timeout
  ) {
    return {
      restrict: 'E',
      scope: {
        beacon: "=",
        save: "&"
      },
      link: function (scope, elem, attrs) {
        elem.bind('click', launchModal);

        scope.needs = [
          'Clothing',
          'Financial',
          'Food/Water',
          'Housing',
          'Laundry',
          'Medical Expertise',
          'Physical Labor',
          'Toiletries',
          'Transportation',
          'Counseling',
          'Lost Home'
        ];

        scope.saveBeacon = function () {
          scope.modal.hide();
          console.log(scope.beacon)
          scope.save()(scope.beacon);
        };

        function launchModal() {
          $ionicModal.fromTemplateUrl('templates/beacon-modal.html', {
            scope: scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            scope.modal = modal;
            scope.modal.show();
          });
        }

      }
    }
  }
]);