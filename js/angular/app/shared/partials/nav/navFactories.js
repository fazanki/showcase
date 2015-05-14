angular.module('appServiceRegirty')
  .factory('NavSerivce', function ($http) {

    var navUrl = 'mock.menu.json';
    
    return {
      getNavItems: function () {
          return $http.get(navUrl);
      }

    };
  });