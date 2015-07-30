var GEOCODE_KEY = 'AIzaSyBPmuX9h6_BEKfKLWy-Kdc1gQHWZQIUGCQ';
var directionsDisplay;      // google display object, display route on map
var directionsService;      // google direction object , gets directions
var distanceService;
var map;                    // this is the actuall google map
var yourLatitude;           // latitude of your current position
var yourLongitude;          // longitude of your current position
var yourLatlng;             // google.maps.LatLng object
var listOfIDs = [];         // the id's of the destinations
var travelModes = {
    'driving' : google.maps.TravelMode.DRIVING,
    'walking' : google.maps.TravelMode.WALKING,
    'transit' : google.maps.TravelMode.TRANSIT
};






// to set center of map  // map.setCenter(results[0].geometry.location);

// when window loads load map
//google.maps.event.addDomListener(window, 'load', initialize);



/*
    get users coordinates using geolocation
*/
$(document).ready(function(){

    loadDots();
    // loadPage();

    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();
    distanceService = new google.maps.DistanceMatrixService();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initialize, handle_error);
    } else {
        handle_error();
    }
});

// funtion loadPage(){
//     var progress = setInterval(function() {
//         var $bar = $('.bar');

//         if ($bar.width()==400) {
//             clearInterval(progress);
//             $('.progress-bar').removeClass('active');
//         } else {
//             $bar.width($bar.width()+40);
//         }
//         $bar.text($bar.width()/4 + "%");
//     }, 800);
// }



function loadDots(){
    var dot = 1;

    var dotInterval = setInterval(function(){
        $('#dot' + dot).css('background-color','blue');
        dot++;
        if(dot == 6)
        {
            clearInterval(dotInterval);
           setTimeout(function(){
                $('.overlay').css('display','none');
           }, 500);
        }
    }, 200);
}


var dotLoaded = 1;
function loadDot(){

    // do not want to delay load dot for geolocation since it takes forever to load
    setTimeout(function()
    {
        $('#dot' + dotLoaded).css('background-color','blue');
        dotLoaded++;
        if(dotLoaded == 6)
        {
          // remove loading status
            setTimeout(function(){
              $('.overlay').css('display','none');
            }, 500);
        }
    }, 200);

}


/*
    event: #update on click
    update user's current addresss
*/
$(function(){
   $('#update').click(function(){
       // hide text that says 'Your browser doesn't support Geolocation.'
       document.getElementById('geolocationFailModal-title').innerHTML = "Enter your location: ";
       $('#Modal').modal('show');
   });
});


/*
    event: update transporation when select option is changed
    update time and/or transportation type when 'update transporation button is changed'
*/
$(function() {

    // when document is ready show departure time if transit is already selected
    if($('#transitType').val() == 'Transit'){
        $('#transitDeparture').show();
    }


    $('#transitType').on( "change", function(){
        var transitType = $('#transitType').val();

        // if travel mode is transit show  departure time
        if(transitType == 'Transit'){
            $('#transitDeparture').show();
        }else{
            $('#transitDeparture').hide();
        }


        // remove all current destinationBlocks
        $('.destinationBlock').remove();
        // remove directions info div
        $('#directionInfoDiv').remove();


        // remove all previous directions before getting new
        var scopeDirections = angular.element(document.getElementById("directionsCtrl")).scope();
        scopeDirections.directionBlocks = [];

        // delete all markers from map
        google.maps.Map.prototype.clearMarkers = function() {
            for(var i=0; i < this.markers.length; i++){
                this.markers[i].setMap(null);
            }
            this.markers = new Array();
        };

        // add destinations with new transporation type
        var scopeDestinations = angular.element(document.getElementById("destinationBlockCtrl")).scope();
        scopeDestinations.getDestinations(transitType);




    });
});





/* compute geolocation */
$(function() {

    $(document).on("click", '#manualGeolocation', function() {
        // close address modal
        $('#Modal').modal('toggle');

        var geocoder = new google.maps.Geocoder();
        var lat, lng;
        var address = $('#userAddress').val();
        var city = $('#userCity').val();
        var state = $('#userState').val();
        var zip = $('#userZip').val();
        var location = '';



        if(address != 'undefined' && address!=undefined)
        {
            location += address + ', ';
        }
        location += city + ', ' + state + ' ' + zip;

        geocoder.geocode( { 'address': location}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                lat = results[0].geometry.location.A;
                lng = results[0].geometry.location.F;

                var position = {coords:{
                    latitude: lat,
                    longitude: lng
                }};

                initialize(position);
            } else
            {
              alert('Not proper address.');
              handle_error();
            }
        });

    });


});




/*
    -   error callback for geolocation
    -   gelocation does not work on - internet explorer 11
*/
function handle_error(){
    $('.overlay').css('display','none');
    $('#Modal').modal('show');
}





/*
    - set map
    - save current position/ coordinates to map
*/
function initialize(position) {

    yourLatitude = position.coords.latitude;
    yourLongitude = position.coords.longitude;

    yourLatlng = new google.maps.LatLng(yourLatitude,yourLongitude);

    //set map configuration
    var mapOptions = {
        center: yourLatlng,
        zoom: 15,
        scrollwheel: false
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    // this enables the display to draw routes on map
    directionsDisplay.setMap(map);


    // add your current location to map
    addMarker(yourLatlng,'You','');


    // create destination blocks
    var scope = angular.element(document.getElementById("destinationBlockCtrl")).scope();
    scope.getDestinations($('#transitType').val());
}




/* set marker on google maps of current location */
function addMarker(myLatlng, title, description){
     var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: title
    });

    //create info window for marker when clicked
    var infowindow = new google.maps.InfoWindow({
        content: title+"<br/>"+description
    });

    // add event listener to marker

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
    });

    // open infowindow for your current location
    if(title == 'You')
    {
        infowindow.open(map,marker);
    }

}


function getTime(hrs,mins){
    var date;
    var mins = $('#mins').val();
    var hrs = $('#hours').val();
    var period = $('#period').val();

    if(hrs == 'Now'){
        date =  new Date();
    }else{
        var dateObj = new Date();
        var year = dateObj.getUTCFullYear();
        var month = dateObj.getMonth();
        var day = dateObj.getUTCDate();

        if(period == 'PM' && hrs != '12')
        {
            hrs = 12 + parseInt(hrs);
        }
        else if(period == 'AM' && hrs == '12')
        {
            hrs = '24';
        }

        date = new Date(year, month, day, hrs, mins, 0);
    }

    return date;
}








/*
    -   geocode reverse lookup
    -   get the address of a given latitude/longitude
*/
function getAddress(LATITUDE, LONGITUDE)
{
    var address;
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(LATITUDE, LONGITUDE);

    if (geocoder) {
        geocoder.geocode({'latLng': latlng}, function (results, status)
        {
            if (status == google.maps.GeocoderStatus.OK)
            {
                console.log(results[0].geometry.location);
                address = results[2].formatted_address;
            }
            else
            {
                console.log('No results found: ' + status);
            }
        });
    }
    return address;
}


function printJSON(json){
    alert(JSON.stringify(json, null, 2));
    console.log(JSON.stringify(json, null, 2));
}









//================================================================================




/*
Local scope:
    response: json object containing directions info
Arguments:
    data: json object containing destinations info
    index: index of current destination
    stop: total number of destinations, base case
    destinations: stores each destination containing destination info + distance/duration
    durations: contains duration of every destination, used for ordering destination blocks
Function
    - set up controller
    - getDestinations - get json object from server
    - createBlock - change the model to add new destination
*/
tripplanner.controller('destinationBlockCtrl', function($scope, $http){

    $scope.deleteDestination = function(id, name){
        if(confirm('Delete ' + name + '?')){
            $http.get('http://tripplanner.pythonanywhere.com/deleteDestination', {
                params: {
                    id:parseInt(id)
                }
            }).success(function(){
                $('#'+id).hide();
            });
        }
    }

    $scope.getDestinations = function(transitType){

        $scope.destinations = [];

        $http.get('http://tripplanner.pythonanywhere.com/getDestinations').success(function(data){
            var temp = {};
            var durations = [];
            var destinations = [];
            //destinations = createBlock(0, data.list.length, data.list, temp);
            $scope.createBlock(0, data.list.length, data.list, temp, durations, transitType);
        });
    }

    $scope.createBlock = function(index,stop,data,destinations, durations, transitType){

        if(index == stop)
        {
            durations.sort(function(a,b){return a - b});

            for(var z=0; z<durations.length; z++){
                // pull keys in order
                var keyOfNextBlock = durations[z];
                // append next block
                $scope.$apply(function(){
                   $scope.destinations.push(destinations[keyOfNextBlock]);
                });
            }


            return;
        }

        var destinationInfo = data[index];
       // alert(destinationInfo.ID + ' ' + destinationInfo.name);
        var directionrequest =
        {
            origins:  [yourLatlng],
            destinations: [new google.maps.LatLng(destinationInfo.latitude, destinationInfo.longitude)],
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            travelMode: travelModes[transitType.toLowerCase()]
        }

         distanceService.getDistanceMatrix(directionrequest, function(response, status){
            if (response.rows[0].elements[0].status == "OK")
            {
                destinationInfo['totalDistance'] = response.rows[0].elements[0].distance.value;
                destinationInfo['distanceText'] = response.rows[0].elements[0].distance.text;
                destinationInfo['totalDuration'] = response.rows[0].elements[0].duration.value;
                destinationInfo['durationText'] = response.rows[0].elements[0].duration.text;
                //destinations.push(destinationInfo);
                destinations[destinationInfo.totalDuration] = destinationInfo;
                durations.push(destinationInfo.totalDuration);
            }
            else if(response.rows[0].elements[0].status == 'ZERO_RESULTS')
            {  // no route found

            }
            else if(response.rows[0].elements[0].status == "OVER_QUERY_LIMIT")
            {
                alert(name + ' ' + status);
                console.log('OVER_QUERY_LIMIT');
            }

            $scope.createBlock(index+1,stop,data,destinations, durations, transitType);
        });

    }
});




