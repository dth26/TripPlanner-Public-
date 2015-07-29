var tripplanner = angular.module('trip',  ['ngSanitize']);

tripplanner.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}]);