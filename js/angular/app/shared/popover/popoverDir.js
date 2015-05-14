angular.module('appServiceRegirty')

  .directive('popover', function($compile, $window, $timeout) {

    var helper = {
      createList: function(listItems) {
        var $ul = $('<ul />').attr({'class':'popover-content__list'});

        $.each(listItems, function(i, data) {
            $ul.append(
                $('<li />').attr({'class':'popover-content__list-item'}).text(data.name)
                .append($('<a />').attr({'href':'#', 'class':'popover-content__list-item__link'}).text(' edit'))
            );
        });
        $ul.append(
            $('<span />', {'class': 'popover-content__icon glyphicon glyphicon-remove'}).attr({'ng-click':'remove()'})
        );
        return $ul;
      }

    };

    return {
      restrict: 'EAC',

      link: function(scope, elem, attrs) {
        var content,
            fieldtype = attrs.fieldtype,
            tplInput  = $('<div />', {'tabindex':'-1'}).append(
              $('<input/>').attr({value: attrs.fieldname, type: 'text', id: 'test', name: 'test', 'class': 'popover-content__input'}),
              $('<input/>').attr({'ng-click':'onClick()', value: attrs.savename, type: 'submit', 'class': 'popover-content__search btn btn-primary'}),
              $('<button />', {'class': 'popover-content__icon glyphicon glyphicon-remove'}).attr({'ng-click':'remove()'}).html($('<span />', {'class':'visually-hidden'}).text('close'))
          ),
          tplSelect =   ' <ui-select on-select="refresh($item, $model)" ng-model="selectedListItems[key].selected" theme="bootstrap" reset-search-input="false">' +
              '   <ui-select-match placeholder="Search"> ' +
              '      {{ $select.selected.name }} ' +
              '   </ui-select-match> ' +
              '   <ui-select-choices repeat="list in value[field] | filter: $select.search">' +
              '      {{ list.name }}' +
              '   </ui-select-choices>' +
              '  </ui-select>' +
              '  <span class="glyphicon glyphicon-remove" ng-click="remove()"> </span>';

        if ( attrs.listitems !== undefined ) {
            var evalObject  = JSON.parse(attrs.listitems),
                tplListEdit = helper.createList(evalObject);
        }

        if (fieldtype === "select") {
            content = function () {
              return $compile(tplSelect)(scope);
            };
        } else if (fieldtype === "editList") {
            content = function() {
              return $compile(tplListEdit)(scope);
            };
        } else {
            content = function() {
              return $compile(tplInput)(scope);
            };
        }

        elem.popover({
            trigger     : 'manual',
            placement   : 'top',
            html        : true,
            self        : this,
            container   : 'body',
            content     : content,
            'max-width': '100%'
        });

        scope.onClick = function() {
            elem.popover('hide');
        };

        scope.remove = function() {
            elem.popover('hide');
        };

        scope.refresh = function(i, m) {
            elem.popover('hide');
            console.log(i + m);
        };

        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return {
                'h': w.height(),
                'w': w.width()
            };
        };

        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            elem.popover('hide');
        }, true);

        w.bind('resize', function () {
            // if() fixes ie8
            if(!scope.$$phase) {
                scope.$apply();
            }
        });
          
        var $body = angular.element("body"),
            $search = angular.element('.search__input'),
            _hide = function (e) {
              $('.popover').each(function () {

              //Only do this for all popovers other than the current one that cause this event
              if (!($(this).is(e.target) || $(this).has(e.target).length > 0) && $(this).siblings('.popover').length !== 0 && $(this).siblings('.popover').has(e.target).length === 0
                ) {
                console.log('here')
                   //Remove the popover element from the DOM
                   $(this).remove();
                   //Set the state of the popover in the scope to reflect this
                   elem.scope().tt_isOpen = false;
                }
              });
            };
        // Stop propagation when clicking inside popover.
        $timeout(function() {
          $body.on("click", _hide);
        //  $search.on('click', function(){alert('something')});
        }, 0);

        /// edit icon hover effect
        elem.closest('td').bind('mouseenter', function () {
          elem.show();
          elem.popover();
        });

        elem.closest('td').bind('focus', function () {
          elem.show();
        });

        elem.closest('td').bind('mouseleave', function () {
          elem.hide();
        });

        elem.bind('blur', function () {
          elem.hide();
        });

        elem.bind('click', function () {
          elem.popover('toggle');
          var $popover = angular.element('[tabindex="-1"]');
          $popover.focus();
        });
      }
    };
  });