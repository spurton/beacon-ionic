angular.module('ion-google-place', [])
.directive('ionGooglePlace', [
  '$ionicTemplateLoader',
  '$ionicBackdrop',
  '$q',
  '$timeout',
  '$rootScope',
  '$document',
  '$parse',
  function($ionicTemplateLoader, $ionicBackdrop, $q, $timeout, $rootScope, $document, $parse) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        location: '=',
        excursions: '='
      },
      link: function(scope, element, attrs) {
        scope.locations = [];

        var searchEventTimeout = undefined;
        var geocoder = new google.maps.places.AutocompleteService();

        // Process Attributes
        var placeHolderText = "Search for Location";
        var locationTypes = ['geocode', 'establishment'];

        var POPUP_TPL = [
            '<div class="ion-google-place-container">',
                '<div class="bar bar-header item-input-inset">',
                    '<label class="item-input-wrapper">',
                        '<i class="icon ion-ios7-search placeholder-icon"></i>',
                        '<input class="google-place-search" type="search" ng-model="searchQuery"',
                        'placeholder="',
                        placeHolderText,
                        '">',
                    '</label>',
                    '<button class="button">',
                        'Cancel',
                    '</button>',
                '</div>',
                '<ion-content class="has-header has-header">',
                    '<ion-list>',
                        '<ion-item ng-repeat="location in locations" type="item-text-wrap" ng-click="selectLocation(location)">',
                            '{{location.description}}',
                        '</ion-item>',
                    '</ion-list>',
                '</ion-content>',
            '</div>'
        ].join('');

        var popupPromise = $ionicTemplateLoader.compile({
          template: POPUP_TPL,
          scope: scope,
          appendTo: $document[0].body
        });

        popupPromise.then(function(el){
            var searchInputElement = angular.element(el.element.find('input'));

            scope.selectLocation = function(location){
                var placesService = new google.maps.places.PlacesService(element.children()[0]);
                placesService.getDetails(
                  {
                    'reference': location.reference
                  },
                  function detailsresult(detailsResult, placesServiceStatus) {
                    if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                      scope.$apply(function() {
                        scope.locations = [];                        
                        scope.searchQuery = '';

                        var formattedResult = formatResult(detailsResult);

                        if (scope.excursions) {
                          formattedResult.pos = scope.excursions.length;
                          scope.excursions.push(formattedResult)
                        } else {
                          scope.location = formattedResult;
                          element.val(formattedResult.name);
                        }
                      });
                    }
                  }
                );

                el.element.css('display', 'none');
                $ionicBackdrop.release();
            };

            scope.$watch('searchQuery', function(query){
                if (searchEventTimeout) $timeout.cancel(searchEventTimeout);

                searchEventTimeout = $timeout(function() {
                    if(!query) return;
                    if(query.length < 3);
                    geocoder.getPlacePredictions(
                    {
                        input: query,
                        types: locationTypes
                    },
                    function(results, status) {
                      if (status == google.maps.GeocoderStatus.OK) {
                        scope.$apply(function(){
                          scope.locations = results;
                        });
                      }
                    });
                }, 350);
            });

            var onClick = function(e){
              e.preventDefault();
              e.stopPropagation();
              $ionicBackdrop.retain();
              el.element.css('display', 'block');
              searchInputElement[0].focus();
              setTimeout(function(){searchInputElement[0].focus();},0);
            };

            var onCancel = function(e){
              scope.searchQuery = '';
              $ionicBackdrop.release();
              el.element.css('display', 'none');
            };

            element.bind('click', onClick);
            element.bind('touchend', onClick);
            el.element.find('button').bind('click', onCancel);
        });

        function formatResult(result) {
          var loc = {};
          loc.name = result.name;
          loc.place_id = result.place_id;
          if (result.website) loc.website = result.website;
          if (result.rating) loc.rating = result.rating;
          if (result.types) loc.types = result.types;
          if (result.formatted_address) loc.formatted_address = result.formatted_address;
          if (result.formatted_phone_number) loc.formatted_phone_number = result.formatted_phone_number;
          loc.lat = result.geometry.location.lat();
          loc.lng = result.geometry.location.lng();

          return loc;
        }
      }
    };
  }
]);