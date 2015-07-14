var GEOCODE_KEY = 'AIzaSyBPmuX9h6_BEKfKLWy-Kdc1gQHWZQIUGCQ';
var directionsDisplay;
var directionsService;
var map;
var yourLatitude;
var yourLongitude;
var yourLatlng;
var listOfIDs = [];

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




/* set map */
/* save current position/ coordinates to map */
function initialize(position) {
    directionsDisplay = new google.maps.DirectionsRenderer();
    yourLatitude = position.coords.latitude;
    yourLongitude = position.coords.longitude;
 //  alert('Your Current Coordinates: ' + latitude + " " + longitude);
    yourLatlng = new google.maps.LatLng(yourLatitude,yourLongitude);

    /* set map configuration */
    var mapOptions = {
        center: yourLatlng,
        zoom: 13
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    // this enables the display to draw routes on map
    directionsDisplay.setMap(map);

    // add your current location to map
    addMarker(yourLatlng,'You','This is where you are<br/>Zoom out to see other destinations');

    // add destinations to map
    getDestinations();
}
//google.maps.event.addDomListener(window, 'load', initialize);




/* get directions from origin to destination */
function getDirections(destination, travelMode)
{

	var directionrequest =
    {
		origin: yourLatlng,
 		destination: destination,
		travelMode: travelMode
	}

	directionsService.route(directionrequest, function(response, status){

	   // alert(JSON.stringify(response));
	    if (status == google.maps.DirectionsStatus.OK) {
		    directionsDisplay.setDirections(response);
	    }
	});


}



/* get directions info */
function getDirectionInfo(destination, ptrBlockMenu, ID)
{
    var coordinates, latitude, longitude, durationText, durationSeconds,distance, route;
    var totalDistance = 0, totalDuration = 0;

	directionsService = new google.maps.DirectionsService();

	var directionrequest =
    {
		origin: yourLatlng,
 		destination: destination,
		travelMode: google.maps.TravelMode.WALKING
	}

	directionsService.route(directionrequest, function(response, status){

	   // alert(JSON.stringify(response));
	    if (status == google.maps.DirectionsStatus.OK) {
		    route = response.routes[0].legs[0];
		    // get individual steps
		    for(var i=0; i< route.steps.length; i++)
	        {
	            //directionsText += route.steps[i].instructions + "\n";
	            /*
	            coordinates = route.steps[i].start_point.toString();
        		latitude = coordinates.substring(coordinates.lastIndexOf('(')+1,coordinates.lastIndexOf(','));
        		longitude = coordinates.substring(coordinates.lastIndexOf(',')+1,coordinates.lastIndexOf(')'));
        		*/
        		distance = route.steps[i].distance.value;
        		durationText = route.steps[i].duration.text;
        		durationSeconds = route.steps[i].duration.value;
        		totalDistance += distance;
        		totalDuration += durationSeconds;
         		//getAddress(latitude , longitude);
        	}

            // create menu items
             /*
                totalDistance = meters
                1 meter = 0.000621371192 mile
            */
            var menuItemDistance = document.createElement('div');
            menuItemDistance.className = 'blockMenuItem';
            menuItemDistance.id = ID + 'distanceItem';
            menuItemDistance.innerHTML = Number(totalDistance*0.000621371192).toFixed(1) + 'mi' ;
            ptrBlockMenu.appendChild(menuItemDistance);

            /*
                duration menuItem
                totalDuration = seconds
            */
            var menuItemDuration = document.createElement('div');
            menuItemDuration.className = 'blockMenuItem';
            menuItemDuration.id = ID + 'durationItem';

            // convert duration into hrs:mins
            var timeMins = totalDuration/60;
            var hours = Math.floor(timeMins/60);
            var mins = Math.floor(timeMins - (hours*60));
            menuItemDuration.innerHTML = hours+"hrs:"+mins+"mins";
            ptrBlockMenu.appendChild(menuItemDuration);

            // store duration in hidden input
            var input = document.createElement('input');
            input.setAttribute('type','hidden');
            input.setAttribute('id', ID + 'Duration');
            input.setAttribute('value',totalDuration);
            ptrBlockMenu.appendChild(input);
	    }
	});

    /*
	setTimeout(function(){
	    alert(directionsText);
	}, 2000);
    */
}





/* geocode reverse lookup */
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


/* ajax callback
   list all destinations
*/
function addNewDestination(data){

    for(var row in data.list)
    {
        var ID = data.list[row].ID;
        var url = data.list[row].url;
        var name = data.list[row].name;
        var description =  data.list[row].description;
        var latitude = data.list[row].latitude;
        var longitude = data.list[row].longitude;
        var latlng = new google.maps.LatLng(latitude, longitude);

        // keep list of ID's so that destinations can later be ordered depending on distance
        listOfIDs.push(ID);

        addMarker(latlng, name, description);

        // create new block and append to centerContainer
        var newBlock = document.createElement('div');
        newBlock.id = ID;
        newBlock.className = 'block';
        document.getElementById('centerContainer').appendChild(newBlock);

        // create header for block and append to centerContainer
        var blockHeader = document.createElement('div');
        blockHeader.className = 'blockHeader';
        blockHeader.id = ID + 'Header';
        newBlock.appendChild(blockHeader);


        // put order div into link
        var order = document.createElement('div');
        order.setAttribute('class','order');
        order.id = ID + 'Order';
        blockHeader.appendChild(order);

        // create link for url and append to header
        var link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('target', 'blank');
        link.className = 'linkURL';
        link.id = ID + 'Link';
        link.innerHTML = name;
        blockHeader.appendChild(link);



        // create menu
        var menu = document.createElement('div');
        menu.className = 'blockHeaderMenu';
        menu.id = ID + 'Menu';
        blockHeader.appendChild(menu);


        // add menu item for mapping path on map when clicked
        var menuItemDirections = document.createElement('div');
        menuItemDirections.className = 'blockMenuItem GetDirections';
        menuItemDirections.id = ID + 'GetDirections';
        // create image of map item
        var directionsImg = document.createElement('img');
        directionsImg.src = '../static/images/map.png';
        menuItemDirections.appendChild(directionsImg);
        menu.appendChild(menuItemDirections);



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
        menu.appendChild(latitudeItem);
        menu.appendChild(longitudeItem);

        getDirectionInfo(latlng, menu, ID);                 // data about directions from your position to specific destination

    }

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

    }, 1000);


}

/*
    get destinations from server, then call function addNewDestination to add
    destination to map
*/
function getDestinations(){
    $.ajax({
    		type: 'GET',
    		url: 'http://tripplanner.pythonanywhere.com/getDestinations',
    		dataType:'json',
    		success: addNewDestination,
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


//http://www.gisgraphy.com/
$(document).ready(function(){

        //getCoordinates('53 Mulberry Dr, Holland, Pa 18966');

        var latitude;
        var longitude;

        /* get our current location */
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(initialize);
        } else {
            alert("Geolocation is not supported by this browser.");
        }

});


/* add click event to map item to draw path from origin to destination
    must use function 'on' for dyncamically created elements
*/
$(function() {
    $(document).on("click", '.GetDirections', function() {
        var destID = $(this).attr('id');
        var latitude = $('#' + destID + 'Latitude').attr('value');
        var longitude = $('#' + destID + 'Longitude').attr('value');
        var latlng = new google.maps.LatLng(latitude, longitude);

        getDirections(latlng, google.maps.TravelMode.WALKING);

    });
 });