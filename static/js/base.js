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
        $('#loginModal').modal('toggle');
        $http.get('http://tripplanner.pythonanywhere.com/logout', {
        }).success(function(data){
                $scope.username = undefined;
                $scope.isLogged = false;
        });
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


//==============================================
//============ swipe functionality =============
//==============================================
var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints

if(supportsTouch){
    $(document).on("pagecreate",".container-fluid",function(){
        var nextView;

        $(".container-fluid").on("swipeleft",function(){
            var currView = $('#currPage').attr('value');
            if(currView == 'navtab4'){
                nextView = 'navtab1';
            }else if (currView == 'navtab1'){
                nextView = 'navtab2';
            }else if (currView == 'navtab2'){
                nextView = 'navtab3';
            }else if (currView == 'navtab3'){
                nextView = 'navtab4'
            }
        //    alert('curr: '+currView +'\nnext: '+ nextView);
            switchTab(nextView, "left");
        });

        $(".container-fluid").on("swiperight",function(){
            var currView =  $('#currPage').attr('value');

            if(currView == 'navtab1'){
                nextView = 'navtab4';
            }else if (currView == 'navtab2'){
                nextView = 'navtab1';
            }else if (currView == 'navtab3'){
                nextView = 'navtab2';
            }else if (currView == 'navtab4'){
                nextView = 'navtab3'
            }
            // alert('curr: '+currView +'\nnext: '+ nextView);
            switchTab(nextView, "right");
        });
    });
}




$(document).ready(function(){
    // IMPLEMENT SWITCHING TABS
    $('#navtab1, #navtab2, #navtab3, #navtab4').click(function(){
        switchTab(this.id, "fade");
    });
});


function tabShow(ID, direction){
    if(direction=="left"){
        $(ID).show("slide", { direction: "right" }, 500);
    }else if(direction=="right"){
        $(ID).show("slide", { direction: "left" }, 500);
    }else{
        $(ID).fadeIn(1000);
    }
}

function switchTab(ID, direction){
      //showing content1
    if(ID == 'navtab1'){
        $('#currPage').attr('value','navtab1');

        if ($('#view1').is(':hidden')){
            if($('#view2').is(':visible')){
                $("#view2").hide();
            }else if($('#view3').is(':visible')){
                $("#view3").hide();
            }else if($('#view4').is(':visible')){
                $("#view4").hide();
            }
            $("#map-canvas").show();
            tabShow("#view1", direction);
        }
    }
    //showing content2
    else if(ID == 'navtab2'){
        $('#currPage').attr('value','navtab2');

        if ($('#view2').is(':hidden')){
            if($('#view1').is(':visible')){
                $("#view1").hide();
                $("#map-canvas").hide();
            }else if($('#view3').is(':visible')){
                $("#view3").hide();
            }else if($('#view4').is(':visible')){
                $("#view4").hide();
            }
            tabShow("#view2", direction);
        }
    }
    //showing content3
    else if(ID == 'navtab3'){
        $('#currPage').attr('value','navtab3');

        if ($('#view3').is(':hidden')){
            if($('#view1').is(':visible')){
                $("#view1").hide();
                $("#map-canvas").hide();
            }else if($('#view2').is(':visible')){
                $("#view2").hide();
            }else if($('#view4').is(':visible')){
                $("#view4").hide();
            }
            tabShow("#view3", direction);
        }
    }
    //showing content4
    else if(ID == 'navtab4'){
        $('#currPage').attr('value','navtab4');

        if ($('#view4').is(':hidden')){
            if($('#view1').is(':visible')){
                $("#view1").hide();
                $("#map-canvas").hide();
            }else if($('#view2').is(':visible')){
                $("#view2").hide();
            }else if($('#view3').is(':visible')){
                $("#view3").hide();
            }
            tabShow("#view4", direction);
        }
    }
}