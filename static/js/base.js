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

// must import jquery mobile for this to work

// var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints

// if(supportsTouch){
//     $(document).on("pagecreate",".container-fluid",function(){
//         var nextView;

//         $(".container-fluid").on("swipeleft",function(){
//             var currView = $('#currPage').attr('value');
//             if(currView == 'navtab4'){
//                 nextView = 'navtab1';
//             }else if (currView == 'navtab1'){
//                 nextView = 'navtab2';
//             }else if (currView == 'navtab2'){
//                 nextView = 'navtab3';
//             }else if (currView == 'navtab3'){
//                 nextView = 'navtab4'
//             }
//         //    alert('curr: '+currView +'\nnext: '+ nextView);
//             switchTab(nextView, "left");
//         });

//         $(".container-fluid").on("swiperight",function(){
//             var currView =  $('#currPage').attr('value');

//             if(currView == 'navtab1'){
//                 nextView = 'navtab4';
//             }else if (currView == 'navtab2'){
//                 nextView = 'navtab1';
//             }else if (currView == 'navtab3'){
//                 nextView = 'navtab2';
//             }else if (currView == 'navtab4'){
//                 nextView = 'navtab3'
//             }
//             // alert('curr: '+currView +'\nnext: '+ nextView);
//             switchTab(nextView, "right");
//         });
//     });
// }


var currTab;

$(document).ready(function(){

    var currTab = "#map";

    // // IMPLEMENT SWITCHING TABS
    // $('#navtab1, #navtab2, #navtab3, #navtab4').click(function(){
    //     switchTab(this.id, "fade");
    // });
    $('#destImg, #mapImg, #newImg, #directImg, #destItm, #mapItm, #newItm, #directItm, #aboutItm, #aboutImg, #savedDirImg, #savedDirItm').click(function(){
        switchTab(this.id);
    });



    // $('#destImg, #destItm').hover(function(){
    //     $('#destItm').css('color', '#989EE3');
    // }, function(){
    //     $('#destItm').css('color', '#C6CCCF');
    // });

    // $('#newImg, #newItm').hover(function(){
    //     $('#newItm').css('color', '#989EE3');
    // }, function(){
    //     $('#newItm').css('color', '#C6CCCF');
    // });

    // $('#mapImg, #mapItem').hover(function(){
    //     $('#mapItm').css('color', '#989EE3');
    // }, function(){
    //     $('#mapItm').css('color', '#C6CCCF');
    // });

    // $('#aboutImg, #aboutItm').hover(function(){
    //     $('#aboutItm').css('color', '#989EE3');
    // }, function(){
    //     $('#aboutItm').css('color', '#C6CCCF');
    // });
});



function switchTab(ID){

    var tabID = '#' + ID.substring(0, ID.length-3);

    if(tabID == "#map"){
        $('#directionsModal').modal('show');
    }

    //hide directions modal if tab is switched
    if(currTab == "#map"){
        $('#directionsModal').modal('hide');
    }
    currTab = tabID;

    $('.menuItem').each(function(){
        //alert($(this).attr('id'));
        if($(this).hasClass('menuItemColorSelected')){
           // $('#'+$(this).attr('id')).removeClass('menuItemColorSelected');
           $(this).removeClass('menuItemColorSelected');
           $(this).addClass('menuItemColorBase');
        }

        // $(this).addClass('menuItemColorBase');
    });

    $('.view').hide();
    $(tabID).fadeIn(1000);
 //   alert(tabID + "Itm");
    $(tabID + "Itm").removeClass('menuItemColorBase');
    $(tabID + "Itm").addClass('menuItemColorSelected');
    // $(tabID + "Itm").css('color','#989EE3');
}