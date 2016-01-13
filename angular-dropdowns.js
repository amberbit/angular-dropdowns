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
      '<div class="dropdown" ng-if="dropdownSelect.length != 0 || filterOption || dropdownLinkLabel">',
        '<input ng-show="filterOption" id="filter" type="text" ng-model="search" tabindex={{tabIndex}}/>',
        '<ul>',
          '<li ng-show="nullOption" ng-class="{active: dropdownValue == null}">',
            '<a href="" class="dropdown-item" tabindex="-1"',
            ' ng-click="selectNullOption()">',
              '{{dropdownPlaceholder}}',
          '</li>',
          '<li ng-repeat="dropdownSelectItem in dropdownSelect | filter:search" ng-class="{active: dropdownSelectItem[keyName()] == dropdownValue}">',
            '<a href="" class="dropdown-item" tabindex="-1"',
            ' ng-click="select(dropdownSelectItem)">',
              '{{dropdownSelectItem[labelField]}}',
            '</a>',
          '</li>',
          '<li ng-show = "dropdownLinkLabel">',
            '<hr/>',
            '<a class = "special-link" ng-href="#" ng-click="dropdownLinkFunction()">{{dropdownLinkLabel}}</a>',
          '</li>',
        '</ul>',
        '</div>',
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
        dropdownOnchange: '&',
        labelField: '@dropdownItemLabel',
        dropdownKeyName: '@',
        nullOption: '=dropdownNullable',
        filterOption: '=dropdownFilter',
        dropdownLinkFunction: '&',
        dropdownLinkLabel: '@'
      },

      controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
        $scope.tabIndex = $attrs.tabindex || 100;

        $scope.keyName = function () {
          return $scope.dropdownKeyName || 'someprop';
        }

        DropdownService.register($element);

        $scope._selectedOption= {}

        if (!$scope.dropdownSelect) {
          $scope.dropdownSelect = []
        }

        this.updateSelected = function () {
          $scope._selectedOption = {}
          angular.forEach($scope.dropdownSelect, function(el) {
            if (el[$scope.keyName()] === $scope.dropdownValue) {
              $scope._selectedOption = angular.copy(el);
              return false;
            }
            return true;
          });
          $scope.search = "";
        };

        $scope.select = function (selected) {
          $scope.dropdownValue = selected[$scope.keyName()];
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
          return;
        });


        $element.bind('focusin', function (event) {
          event.stopPropagation();
          if ($scope.filterOption) {
            $element.find("input")[0].focus();
          }
          DropdownService.setActive($element);
          return;
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
          nullObject[$scope.keyName()] = null;
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
      if (e.which == 9) {
        angular.forEach(_dropdowns, function (el) {
          el.removeClass('active');
          el.removeClass('focused');
        });
      };
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

    service.setActive = function (ddEl) {
      angular.forEach(_dropdowns, function (el) {
        if (el !== ddEl) {
          el.removeClass('active');
          el.removeClass('focused');
        }
      });

      ddEl.addClass('active');
      ddEl.addClass('focused');
    };

    return service;
  }
]);
})(window, window.angular);
