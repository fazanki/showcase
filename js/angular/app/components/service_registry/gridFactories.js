angular.module('appServiceRegirty')
    .factory('GridSerivce', function ($http) {
      var computeUrl = 'mock.compute.f.json';
  
      return {
        getGridItems: function () {
            return $http.get(computeUrl);
        }
     
      };
    });