angular.module('contacts-loader', [])
.directive('contactsModal', [
  '$ionicLoading',
  '$ionicModal',
  '$ionicSlideBoxDelegate',
  '$ionicPopup',
  '$state',
  '$timeout',
  '$cordovaContacts',
  '$ionicPopup',
  '$ionicLoading',
  function(
    $ionicLoading,
    $ionicModal,
    $ionicSlideBoxDelegate,
    $ionicPopup,
    $state,
    $timeout,
    $cordovaContacts,
    $ionicPopup,
    $ionicLoading
  ) {
    return {
      restrict: 'E',
      scope: {
        excursion: "=",
        save: "&"
      },
      link: function (scope, elem, attrs) {
        elem.bind('click', launchModal);

        scope.saveContacts = function () {
          scope.modal.hide();
        };

        function launchModal() {
          scope.show($ionicLoading);

          $ionicModal.fromTemplateUrl('templates/contacts-modal.html', {
            scope: scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            $cordovaContacts.find({}).then(function(contacts) {
              scope.contacts = contacts;
            }, function(error) {
              //NOTE: Not sure what we want to do here
            });
            scope.modal = modal;
            scope.modal.show();
            scope.hide($ionicLoading);
            console.log(scope.contacts);
          });
        };

        scope.show = function() {
          $ionicLoading.show({
            template: '<p>Loading...</p><ion-spinner></ion-spinner>'
          }).then(function(){
             console.log("Loading indicator");
          });
        };
        
        scope.hide = function(){
          $ionicLoading.hide().then(function(){
             console.log("Loading indicator closed");
          });
        };

        scope.showPopup = function(contact) {
          var attendee = findOrCreateAttendee(contact);

          scope.numbers = contact.phoneNumbers;

          scope.saveNumber = function(number) {
            var formattedNumber = leodido.i18n.PhoneNumbers.formatNumber(number.value, contact.region)
            attendee.methods.push({type: 'phone', value: formattedNumber});

            // Only put the emails in there once
            if(!attendee.methods.some(hasEmail)) {
              contact.emails.map(function(email){
                attendee.methods.push({type: 'email', value: email.value});
              });
            }
          
            contact.added = true;
            number.added = true;
          };

          var myPopup = $ionicPopup.show({
            templateUrl: 'templates/phone-number-select.html',
            title: 'Choose the best number',
            scope: scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Done</b>',
                type: 'button-positive',
                onTap: function(e) {
                  console.log(e);
                }
              }
            ]
          });

          function hasEmail(method) {
            if(method.type === 'email') return true;
          }

          function findOrCreateAttendee(contact) {
            var attendees = scope.excursion.attendees;
            var attendee = null;

            var foundAttendee = attendees.map(function(attendee){
              if(attendee.name === contact.name.formatted) {
                return attendee;
              }
            });

            if (foundAttendee[0] != null) {
              return foundAttendee[0];
            } else {
              var region = 'US' //Totally guessing here
              if(contact.addresses != null && contact.addresses[0] != null) {
                region = contact.addresses[0].region
              }
              attendeeInfo = {name: contact.name.formatted, region: region, methods: []};
              scope.excursion.attendees.push(attendeeInfo);
              return attendeeInfo;
            }
          };

          myPopup.then(function(res) {
            console.log('Tapped!', res);
          });
        };
      }
    }
  }
]);