/**
 * @license MIT http://jseppi.mit-license.org/license.html
*/
(function(window, angular, undefined) {
'use strict';

var dd = angular.module('ngDropdowns', []);

dd.run(['$templateCache', function ($templateCache) {
  $templateCache.put('ngDropdowns/templates/dropdownSelect.html', [
    '<div class="wrap-dd-select">',
      '<a href="" ng-class="{selected: _selectedOption[labelField]}" >{{_selectedOption[labelField] || dropdownPlaceholder}}</a>',
      '<ul class="dropdown">',
        '<li ng-show="nullOption" ng-class="{active: dropdownValue == null}">',
          '<a href="" class="dropdown-item" tabindex="-1"',
          ' ng-click="selectNullOption()">',
            '{{dropdownPlaceholder}}',
        '</li>',
        '<li ng-repeat="dropdownSelectItem in dropdownSelect" ng-class="{active: dropdownSelectItem[dropdownKeyName] == dropdownValue}">',
          '<a href="" class="dropdown-item" tabindex="-1"',
          ' ng-click="select(dropdownSelectItem)">',
            '{{dropdownSelectItem[labelField]}}',
          '</a>',
        '</li>',
      '</ul>',
    '</div>'
  ].join(''));
}]);

dd.directive('dropdownSelect', ['DropdownService', '$timeout',
  function (DropdownService, $timeout) {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        dropdownSelect: '=',
        dropdownPlaceholder: '=',
        dropdownValue: '=',
        dropdownOnchange: '&'
      },

      controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
        $scope.labelField = $attrs.dropdownItemLabel || 'text';
        $scope.nullOption = $attrs.dropdownNullable || false;
        $scope.dropdownKeyName = $attrs.dropdownKeyName || 'someprop';

        console.debug($scope.labelField);

        DropdownService.register($element);

        $scope._selectedOption= {}

        if (!$scope.dropdownSelect) {
          $scope.dropdownSelect = []
        }

        this.updateSelected = function () {
          $scope._selectedOption = {}
          angular.forEach($scope.dropdownSelect, function(el) {
            if (el[$scope.dropdownKeyName] === $scope.dropdownValue) {
              $scope._selectedOption = angular.copy(el);
              return false;
            }
            return true;
          });
        };

        $scope.select = function (selected) {
          $scope.dropdownValue = selected[$scope.dropdownKeyName];
          angular.copy(selected, $scope._selectedOption);

          $timeout(function() {
            $scope.dropdownOnchange({
              selected: selected
            });
          }, 0);
        };

        this.updateSelected();

        $element.bind('click', function (event) {
          event.stopPropagation();
          DropdownService.toggleActive($element);
        });

        $scope.$on('$destroy', function () {
          DropdownService.unregister($element);
        });

        $scope.$watch('dropdownValue', function (_this) {
          return function() {
            _this.updateSelected();
          };
        }(this));

        $scope.$watch('dropdownSelect', function (_this) {
          return function() {
            _this.updateSelected();
          };
        }(this));

        $scope.selectNullOption = function () {
          var nullObject = {};
          nullObject[$scope.dropdownKeyName] = null;
          $scope.select(nullObject);
        };
      }],
      templateUrl: 'ngDropdowns/templates/dropdownSelect.html'
    };
  }
]);

dd.factory('DropdownService', ['$document',
  function ($document) {
    var body = $document.find('body'),
        service = {},
        _dropdowns = [];

    body.bind('click', function () {
      angular.forEach(_dropdowns, function (el) {
        el.removeClass('active');
        el.removeClass('focused');
      });
    });

    body.bind('keydown', function (e) {
      if (e.which == 9)
        angular.forEach(_dropdowns, function (el) {
          el.removeClass('active');
          el.removeClass('focused');
        });
    });

    service.register = function (ddEl) {
      _dropdowns.push(ddEl);
    };

    service.unregister = function (ddEl) {
      var index;
      index = _dropdowns.indexOf(ddEl);
      if (index > -1) {
        _dropdowns.splice(index, 1);
      }
    };

    service.toggleActive = function (ddEl) {
      angular.forEach(_dropdowns, function (el) {
        if (el !== ddEl) {
          el.removeClass('active');
          el.removeClass('focused');
        }
      });

      ddEl.toggleClass('active');
      ddEl.addClass('focused');
    };

    return service;
  }
]);
})(window, window.angular);
