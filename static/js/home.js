var GEOCODE_KEY = 'AIzaSyBPmuX9h6_BEKfKLWy-Kdc1gQHWZQIUGCQ';
var directionsDisplay;      // google display object, display route on map
var directionsService;      // google direction object , gets directions
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

     // set first loading dot
    loadDot();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initialize, handle_error);
    } else {
        handle_error();
    }
});



var dotLoaded = 1;
function loadDot(){

    // do not want to delay load dot for geolocation since it takes forever to load
    if(dotLoaded==20){
        $('#dot' + dotLoaded).css('background-color','blue');
        dotLoaded++;
    }else{
        setInterval(function()
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
        }, 800);
    }

}

/*
    event: map icon is clicked
    add click event to map item to draw path from origin to destination
    must use function 'on' for dyncamically created elements
*/
$(function() {
    // $(document).on("click", '.GetDirections', function() {
    //     var destID = $(this).attr('id');
    //     var latitude = $('#' + destID + 'Latitude').attr('value');
    //     var longitude = $('#' + destID + 'Longitude').attr('value');
    //     var latlng = new google.maps.LatLng(latitude, longitude);
    //     var transitType = $('#transitType').val();
    //     getDirections(latlng, transitType);

    // });
 });

/*
    event: update transporation button is clicked
    update time and/or transportation type when 'update transporation button is clicked'
*/
$(function() {
    $(document).on("click", '#update', function() {
        var transitType = $('#transitType').val();

        // remove all current destinationBlocks
        $('.destinationBlock').remove();

        // remove all previous directions before getting new
        $('#directions').empty();

        // delete all markers from map
        google.maps.Map.prototype.clearMarkers = function() {
            for(var i=0; i < this.markers.length; i++){
                this.markers[i].setMap(null);
            }
            this.markers = new Array();
        };

        // add destinations with new transporation type
        getDestinations(transitType);
    });
});


/* clear direction block if exit clicked */
$(function(){
    $('.innerLeftHeader').click(function(){
        var exitID = '#' + $(this).attr('id');
        var subBlockID = exitID.substring(0, exitID.length-5);
        subBlockID += 'subBlock';
        $(subBlockID).hide();
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
    loadDot();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();

    yourLatitude = position.coords.latitude;
    yourLongitude = position.coords.longitude;

    yourLatlng = new google.maps.LatLng(yourLatitude,yourLongitude);

    //set map configuration
    var mapOptions = {
        center: yourLatlng,
        zoom: 15
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    // this enables the display to draw routes on map
    directionsDisplay.setMap(map);

    // add your current location to map
    addMarker(yourLatlng,'You','');
    var transitType = $('#transitType').val();
    // make ajax call and get destinations from server
    getDestinations(transitType);

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
    -   get direction data info from google maps api
    -   build destination blocks
*/
function createDestinationBlock(ID, url, name, latitude, longitude, travelMode)
{
    var durationText;
    var distanceText;
    var route;
    var totalDistance = 0;
    var totalDuration = 0;
    travelMode = travelModes[travelMode.toLowerCase()];

    var directionrequest =
    {
        origin: yourLatlng,
        destination: new google.maps.LatLng(latitude, longitude),
        travelMode: travelMode
    }

    // call directionsSerice.route to get directions info
    directionsService.route(directionrequest, function(response, status){

       // set duration and distance menuItems of the route
        if (status == google.maps.DirectionsStatus.OK) {
            route = response.routes[0].legs[0];

            // parse json to get travel info
            totalDistance = route.distance.value;
            distanceText = route.distance.text;
            totalDuration = route.duration.value;
            durationText = route.duration.text;

            // blockMenuItem for display distance
            var menuItemDistance = document.createElement('div');
            menuItemDistance.className = 'blockMenuItem';
            menuItemDistance.id = ID + 'distanceItem';
            menuItemDistance.innerHTML = distanceText;

            // blockMenuItem for display duration
            var menuItemDuration = document.createElement('div');
            menuItemDuration.className = 'blockMenuItem';
            menuItemDuration.id = ID + 'durationItem';
            menuItemDuration.innerHTML = durationText;

            // store duration in hidden input
            var input = document.createElement('input');
            input.setAttribute('type','hidden');
            input.setAttribute('id', ID + 'Duration');
            input.setAttribute('value',totalDuration);

              // blockMenuItem for mapping path on map when clicked
            var menuItemDirections = document.createElement('div');
            menuItemDirections.className = 'blockMenuItem GetDirections';
            menuItemDirections.id = ID + 'GetDirections';
            // create image of map item
            var directionsImg = document.createElement('img');
            directionsImg.src = '../static/images/map.png';
        }
        else // no route was found from origin to destination
        {
            // blockMenuItem for display distance
            var menuItemNoRoute = document.createElement('div');
            menuItemNoRoute.className = 'blockMenuItem';
            menuItemNoRoute.id = ID + 'noRouteItem';
            menuItemNoRoute.innerHTML = 'No Route Found!';

        }

        // create new destinationBlock
        var destinationBlock = document.createElement('div');
        destinationBlock.id = ID;
        destinationBlock.className = 'block destinationBlock';

        // create header for block and append to container-fluid
        var blockHeader = document.createElement('div');
        blockHeader.className = 'blockHeader';
        blockHeader.id = ID + 'Header';

        // put order div into link
        var order = document.createElement('div');
        order.setAttribute('class','order');
        order.id = ID + 'Order';

        // create link for url and append to header
        var linkURL = document.createElement('a');
        linkURL.setAttribute('href', url);
        linkURL.setAttribute('target', 'blank');
        linkURL.className = 'linkURL';
        linkURL.id = ID + 'Link';
        linkURL.innerHTML = name;



        // create menu
        var menu = document.createElement('div');
        menu.className = 'blockHeaderMenu';
        menu.id = ID + 'Menu';



        //add hidden input to menu to get coordinates
        var latitudeItem = document.createElement('input');
        latitudeItem.className = 'blockMenuItem';
        latitudeItem.id = ID + 'GetDirections' +  'Latitude';
        latitudeItem.type = 'hidden';
        latitudeItem.value = latitude;
        var longitudeItem = document.createElement('input');
        longitudeItem.className = 'blockMenuItem';
        longitudeItem.id = ID + 'GetDirections' + 'Longitude';
        longitudeItem.type = 'hidden';
        longitudeItem.value = longitude;

        //add hidden input to get name of destination
        var destinationNameInput = document.createElement('input');
        destinationNameInput.className = 'blockMenuItem';
        destinationNameInput.id = ID + 'destinationNameInput';
        destinationNameInput.type = 'hidden';
        destinationNameInput.value = name;

         // append children
        document.getElementById('container-fluid').appendChild(destinationBlock);
        destinationBlock.appendChild(blockHeader);
        blockHeader.appendChild(order);
        blockHeader.appendChild(linkURL);
        blockHeader.appendChild(menu);
        menu.appendChild(latitudeItem);
        menu.appendChild(longitudeItem);
        menu.appendChild(destinationNameInput);
        if(status == google.maps.DirectionsStatus.OK){
            menu.appendChild(menuItemDistance);
            menu.appendChild(menuItemDuration);
        }else{
            menu.appendChild(menuItemNoRoute);
        }
        menu.appendChild(menuItemDirections);
        menuItemDirections.appendChild(directionsImg);
        menu.appendChild(input);
    });

}



/*
    -   ajax callback
    -   get data for each destination from database
    -   create new destination block for each destination
    -   add marker for each destination
*/
function addNewDestinations(data, travelMode){

    for(var row in data.list)
    {
        // save data from database
        var ID = data.list[row].ID;
        var url = data.list[row].url;
        var name = data.list[row].name;
        var description =  data.list[row].description;
        var latitude = data.list[row].latitude;
        var longitude = data.list[row].longitude;

        // keep list of ID's so that destinations can later be ordered depending on distance
        listOfIDs.push(ID);

        addMarker(new google.maps.LatLng(latitude, longitude) , name, description);

        createDestinationBlock(ID, url, name, latitude, longitude, travelMode);                 // data about directions from your position to specific destination
    }
    loadDot();
    // this code will start running immediatly if timer isn't added
    setTimeout(function () {

        var counter = 1;
        // order destinations
        while(listOfIDs.length != 0)
        {
            var minID = 0, minValue;
            var currID, currValue;

            for(var i=0; i<listOfIDs.length;i++)
            {

                currID =  listOfIDs[i];
                currValue = $('#' + currID + 'Duration').attr('value');
                currValue = parseInt(currValue);


                if(minID == 0){
                    minID = currID;
                    minValue = currValue;
                    continue;
                }

                if(currValue < minValue)
                {
                    minID = currID;
                    minValue = currValue;
                }
            }

            var indexOfMin = listOfIDs.indexOf(minID);
            listOfIDs.splice(indexOfMin,1);
            $('#'+minID).css('-webkit-order', counter++);
            $('#'+minID).css('order', counter);
            var element = document.getElementById(minID+'Order');
            element.innerHTML = counter -1 + ')';
        }

         loadDot();
    }, 2800);

}

/*
    get destinations from server, then call function addNewDestination to add
    destination to map
*/
function getDestinations(travelMode){
    $.ajax({
        type: 'GET',
        url: 'http://tripplanner.pythonanywhere.com/getDestinations',
        dataType:'json',
        success: function(data) {
            loadDot();
            addNewDestinations(data, travelMode);
        },
        error: function(jqXHR, exception) {
            if (jqXHR.status === 0) {
                alert('Not connect.\n Verify Network.');
            } else if (jqXHR.status == 404) {
                alert('Requested page not found. [404]');
            } else if (jqXHR.status == 500) {
                alert('Internal Server Error [500].');
            } else if (exception === 'parsererror') {
                alert('Requested JSON parse failed.');
            } else if (exception === 'timeout') {
                alert('Time out error.');
            } else if (exception === 'abort') {
                alert('Ajax request aborted.');
            } else {
                alert('Uncaught Error.\n' + jqXHR.responseText);
            }
        }
    });

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

