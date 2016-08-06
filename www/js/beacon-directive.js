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
          { text: 'Clothing', checked: false},
          { text: 'Financial', checked: false},
          { text: 'Food/Water', checked: false},
          { text: 'Housing', checked: false},
          { text: 'Laundry', checked: false},
          { text: 'Medical Expertise', checked: false},
          { text: 'Physical Labor', checked: false},
          { text: 'Toiletries', checked: false},
          { text: 'Transportation', checked: false},
          { text: 'Counseling', checked: false},
          { text: 'Lost Home', checked: false}
        ];

        scope.saveBeacon = function () {
          scope.modal.hide();
          console.log(scope.beacon);
        };

        scope.saveNeed = function(need) {
          if (need.checked) {
            scope.beacon.needs.push(need);
          } else {
            scope.beacon.needs.pop(need);
          }
        }

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