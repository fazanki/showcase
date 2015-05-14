'use strict';

/**
 * @ngdoc overview
 * @name appServiceRegirty
 * @description
 * # appServiceRegirty
 *
 * Main module of the application.
 */
angular
  .module('appServiceRegirty', [
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.select',
    'angularTreeview',
    'angularUtils.directives.dirPagination'
  ])
  .config(function ($routeProvider , $locationProvider) {
    $routeProvider
      .when('/gridView', {
        templateUrl: 'components/service_registry/gridView.html',
        controller: 'GridCtrl'
      })

      .otherwise({
        redirectTo: '/gridView'
      });

      $locationProvider.html5Mode(true);
  })
  .run(function ($rootScope, NavSerivce) {

    var rebuildMenu = function(menuArr) {
      for (var i = 0; i < menuArr.length; i++){
        menuArr[i].children = [];
        for (var q = 0; q < menuArr.length; q++){
          if (menuArr[i].menuId == menuArr[q].parentId){
            var temp = {menuName:menuArr[q].menuName, url:menuArr[q].url};
            menuArr[i].children.push(temp);
          }
        }
      }
      return menuArr;
    };

    NavSerivce.getNavItems().success(function (data) {
      $rootScope.navItems = rebuildMenu(data.menus);
    });

  });
