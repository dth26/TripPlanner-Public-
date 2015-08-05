var tripplanner = angular.module('trip',  ['ngSanitize']);

tripplanner.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}]);



tripplanner.controller('loginCtrl', function($scope, $http){

    $scope.isLogged = false;
    $scope.username = undefined;

    $http.get('http://tripplanner.pythonanywhere.com/isLogged').success(function(data){
        $scope.username = data.username;
        $scope.isLogged = data.isLogged;
    });




    $scope.loadLoginModal = function(){
        $('#loginModal').modal('toggle');
    }

    $scope.login = function(){

        var username = $('#usernameIN').val();
        var password = $('#passwordIN').val();

        $http.get('http://tripplanner.pythonanywhere.com/login', {
            params: {
                username:username,
                password:password
            }
        }).success(function(data){

            $scope.username = data.username;
            $scope.isLogged = data.isLogged;
            if(data.isLogged){
                $('#loginModal').modal('toggle');
                alert('Logged in as ' + username);
            }else{
                alert('Login Fail!');
            }

        });
   }

   $scope.logout = function(){
        $scope.username = undefined;
        $scope.isLogged = false;
        $('#loginModal').modal('toggle');
   }

   $scope.newUser = function(){
        var key = prompt("Enter secret key: ");
        var username = $('#usernameIN').val();
        var password = $('#passwordIN').val();

        $http.get('http://tripplanner.pythonanywhere.com/createUser', {
            params: {
                key:key,
                username:username,
                password:password
            }
        }).success(function(data){
            if(data.success){
                alert('New User Created! Please Login');
                $('#usernameIN').val(username);
                $('#passwordIN').val(password);
            }else{
                alert('Wrong Key!');
            }
        });
   }
});



