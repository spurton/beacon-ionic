angular.module('excursion-info', [])
.directive('excursionInfoModal', [
  '$ionicLoading',
  '$ionicModal',
  '$ionicSlideBoxDelegate',
  '$ionicPopup',
  '$state',
  '$timeout',
  'DateTimePicker',
  function(
    $ionicLoading,
    $ionicModal,
    $ionicSlideBoxDelegate,
    $ionicPopup,
    $state,
    $timeout,
    DateTimePicker
  ) {
    return {
      restrict: 'E',
      scope: {
        excursion: "=",
        save: "&"
      },
      link: function (scope, elem, attrs) {
        elem.bind('click', launchModal);
        scope.excursion.date = new Date();

        scope.saveExcursion = function () {
          scope.modal.hide();
          scope.save()(scope.excursion);
        };

        function launchModal() {
          $ionicModal.fromTemplateUrl('templates/excursion-date-modal.html', {
            scope: scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            scope.modal = modal;
            scope.modal.show();
          });
        }

        DateTimePicker.datePickerObject.callback = dateTimeCallback;
        DateTimePicker.timePickerObject.callback = dateTimeCallback;
        scope.DateTimePicker = DateTimePicker;

        function dateTimeCallback(val) {
          console.log(typeof(val))
          if (typeof(val) === 'undefined') {
            console.log('No date selected');
          } else {
            if (typeof(val) == 'number') {
              var selectedTime = new Date(val * 1000);

              scope.excursion.date.setHours(selectedTime.getUTCHours());
              scope.excursion.date.setMinutes(selectedTime.getUTCMinutes());
            } else {
              var selectedTime = val;

              scope.excursion.date.setYear(selectedTime.getUTCFullYear());
              scope.excursion.date.setMonth(selectedTime.getUTCMonth());
              scope.excursion.date.setDate(selectedTime.getUTCDate());
            }

            var d = scope.excursion.date;
            var newDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()));
            DateTimePicker.timePickerObject.inputEpochTime = newDate.getTime() / 1000;
          }
        }
      }
    }
  }
]);