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

// when window loads load map
google.maps.event.addDomListener(window, 'load', initialize);

function printJSON(json){
    alert(JSON.stringify(json, null, 2));
}


/*
    event: map icon is clicked
    add click event to map item to draw path from origin to destination
    must use function 'on' for dyncamically created elements
*/
$(function() {
    $(document).on("click", '.GetDirections', function() {
        var destID = $(this).attr('id');
        var latitude = $('#' + destID + 'Latitude').attr('value');
        var longitude = $('#' + destID + 'Longitude').attr('value');
        var latlng = new google.maps.LatLng(latitude, longitude);
        var transitType = $('#transitType').val();
        getDirections(latlng, transitType);

    });
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


/* set map */
/* save current position/ coordinates to map */
function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();

    navigator.geolocation.getCurrentPosition(function(position) {
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
    });


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


/* get directions from origin to destination */
function getDirections(destination, travelMode)
{
    // remove all previous directions before getting new
    $('#directions').empty();


    departureTime = getTime();

    travelMode = travelModes[travelMode.toLowerCase()];
    var directionsText = '', busPath;
    var directionrequest =
    {
        origin: yourLatlng,
        destination: destination,
        travelMode: travelMode,
        transitOptions:{
            departureTime:departureTime
        }
    }

    // call directionsSerice.route to get directions
    directionsService.route(directionrequest, function(response, status){
        if (status == google.maps.DirectionsStatus.OK) {
            // display route on map
            directionsDisplay.setDirections(response);

             route = response.routes[0].legs[0];
             //alert(response.routes[0].legs[0].transit);
            // get individual steps
            /*
                say your going to cathedral from bouquet gardens
                step 1: turn left onto S.Bouquet Street
                step 2: turn right onto 5th Ave
                step 3: turn left onto Bigelow Blvd
            */
            var step;
            var transit_name, bus_id, bus_name, bus_agency, departure_time, arrival_time, departure_location, arrival_location; // transit info
            var description, durationText, distanceText; // step info
            var transitText = '';
            for(var i=0; i< route.steps.length; i++)
            {
                step = route.steps[i];

                // parse step info
                durationText = step.duration.text;                              // duration of step, ex: 5 min
                distanceText = step.distance.text;                              // distance of step, ex: 1mile
                description = step.instructions;                                //  Bus towards Inbound-FREEPORT ROAD TO PITTSBURGH

                //printJSON(step);

                // this step's transporation is TRANSIT
                if(step.travel_mode == 'TRANSIT')
                {
                    // parse json to get transit info
                    bus_agency = step.transit.line.agencies[0].name;             // port authority
                    bus_name = step.transit.line.name;                           // monroeville
                    bus_id = step.transit.line.short_name;                       // 64
                    arrival_location = step.transit.arrival_stop.name;           // where the bus will pick you up
                    arrival_time = step.transit.arrival_time.text;               // when the bus will drop you off at destination
                    departure_location = step.transit.departure_stop.name;       // where the bus will drop you off
                    departure_time = step.transit.departure_time.text;           // when bus will pick you up
                    description =  '<span class="header">Bus: </span>' + bus_id + ' - ' + bus_name + ' - ' + description + '<br/>' +
                                   '<span class="header">' + departure_time + '</span>: ' + departure_location + '<br/>' +
                                   '<span class="header">' + arrival_time + '</span>: ' + arrival_location;

                }
                else // walking or driving
                {
                    departure_time = 'undefined';
                }

               // directionsText += '\n\n';


                /*
                    CREATE HTML STEP BLOCKS
                */

                //

                var subBlock = document.createElement('div');
                subBlock.className = 'subBlock';
                subBlock.id = i + 'subBlock';

                var innerLeft = document.createElement('div');
                innerLeft.className = 'innerLeft';
                innerLeft.id = i + 'innerLeft';

                var centerHorizontally = document.createElement('div');
                centerHorizontally.className = 'centerHorizontally';
                centerHorizontally.id = i + 'centerHorizontally';

                var directionImg = document.createElement('img');
                directionImg.className = 'directionImg';
                if(step.travel_mode == 'WALKING'){
                    directionImg.src = '../static/images/walking.png';
                }else{
                    directionImg.src = '../static/images/bus.png';
                }

                var innerLeftTextOne = document.createElement('div');
                innerLeftTextOne.className = 'innerLeftText';
                if(departure_time == 'undefined'){
                    if(step.travel_mode == 'WALKING'){
                        innerLeftTextOne.innerHTML = 'Walk for about';
                    }
                    else if(step.travel_mode == 'DRIVING'){
                        innerLeftTextOne.innerHTML = 'Drive for about';
                    }
                }else{
                    innerLeftTextOne.innerHTML = 'Bus arrives at ' + departure_time;
                }

                var innerLeftTextTwo = document.createElement('div');
                innerLeftTextTwo.className = 'innerLeftText';
                innerLeftTextTwo.innerHTML = durationText + ', ' + distanceText ;

                var agency = document.createElement('div');
                agency.className = 'agency';
                if(step.travel_mode == 'TRANSIT'){
                    agency.innerHTML = '<span class="header">' + bus_agency + '</span>';
                }else if(step.travel_mode == 'WALKING'){
                    agency.innerHTML = '<span class="header">Walking</span>';
                }else if(step.travel_mode == 'DRIVING'){
                    agency.innerHTML = '<span class="header">Driving</span>';
                }


                var innerRight = document.createElement('innerRight');
                innerRight.className = 'innerRight';
                innerRight.innerHTML = description;
                innerRight.id = i + 'innerRight';

                // append children to '#directions' block
                centerHorizontally.appendChild(directionImg);
                centerHorizontally.appendChild(innerLeftTextOne);
                centerHorizontally.appendChild(innerLeftTextTwo);
                centerHorizontally.appendChild(agency);

                innerLeft.appendChild(centerHorizontally);
                subBlock.appendChild(innerLeft);
                subBlock.appendChild(innerRight);
                document.getElementById('directions').appendChild(subBlock);


                // set height of innerLeft
                var centerHorizontallyHeight = $('#' + i + 'centerHorizontally').height();
                $('#' + i + 'innerLeft').css('height', centerHorizontallyHeight);

                 // set height of subBlock so it fits its contents
                var innerLeftHeight = centerHorizontallyHeight;
                var innerRightHeight = $('#'+i + 'innerRight').height();
                var subBlockHeight = (innerLeftHeight > innerRightHeight ? innerLeftHeight : innerRightHeight);
                $('#'+i + 'subBlock').css('height',subBlockHeight);

                // set height of innerLeft block so that border-right stretches to bottom
                $('#'+i + 'innerLeft').css('height',subBlockHeight);



            }

        }
    });


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

        // create header for block and append to centerContainer
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

         // append children
        document.getElementById('centerContainer').appendChild(destinationBlock);
        destinationBlock.appendChild(blockHeader);
        blockHeader.appendChild(order);
        blockHeader.appendChild(linkURL);
        blockHeader.appendChild(menu);
        menu.appendChild(latitudeItem);
        menu.appendChild(longitudeItem);
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

    }, 1500);


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
            addNewDestinations(data, travelMode)
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
