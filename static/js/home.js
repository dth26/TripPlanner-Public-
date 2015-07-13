var GEOCODE_KEY = 'AIzaSyBPmuX9h6_BEKfKLWy-Kdc1gQHWZQIUGCQ';
var map;



/* set marker on google maps of current location */
function addMarker(myLatlng, title, description){
    alert(myLatlng);
     var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: title
    });

    //create info window for marker when clicked
    var infowindow = new google.maps.InfoWindow({
        content: description
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

    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
 //  alert('Your Current Coordinates: ' + latitude + " " + longitude);
    var myLatlng = new google.maps.LatLng(latitude,longitude);

    /* set map configuration */
    var mapOptions = {
        center: myLatlng,
        zoom: 16
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    addMarker(myLatlng,'You','This is where you are<br/>Zoom out to see other destinations');

    // add destinations to map
    getDestinations();
}
//google.maps.event.addDomListener(window, 'load', initialize);


/* get directions */
function getDirections(origin, destination)
{
	var directionsService = new google.maps.DirectionsService();

	var directionrequest =
    {
		origin: origin,
 		destination: destination,
		travelMode: google.maps.TravelMode.DRIVING
	}

	directionsService.route(directionrequest, function(response, status){
	    if (status == google.maps.DirectionsStatus.OK) {
		    getSteps(response);
	    }
	});
}


function getSteps(steps)
{
	var route = steps.routes[0].legs[0];
	var coordinates, latitude, longitude, durationText, durationSeconds;
	var weather = {};

	for(var i=0; i< route.steps.length; i++)
	{
		coordinates = route.steps[i].start_point.toString();
		latitude = coordinates.substring(coordinates.lastIndexOf('(')+1,coordinates.lastIndexOf(','));
		longitude = coordinates.substring(coordinates.lastIndexOf(',')+1,coordinates.lastIndexOf(')'));
		durationText = route.steps[i].duration.text;
		durationSeconds = route.steps[i].duration.value;
 		getAddress(latitude , longitude);
	}
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
    var counter = 1;
    for(var row in data.list)
    {
        var ID = data.list[row].ID;
        var url = data.list[row].url;
        var name = data.list[row].name;
        var description =  data.list[row].description;
        var latitude = data.list[row].latitude;
        var longitude = data.list[row].longitude;
        var latlng = new google.maps.LatLng(latitude, longitude);


        addMarker(latlng, name, description);

        // create new block and append to centerContainer
        var newBlock = document.createElement('div');
        newBlock.id = ID;
        newBlock.className = 'block';
        document.getElementById('centerContainer').appendChild(newBlock);
        var ptrNewBlock = document.getElementById(ID);

        // create header for block and append to centerContainer
        var blockHeader = document.createElement('div');
        blockHeader.className = 'blockHeader';
        blockHeader.id = ID + 'Header';
        ptrNewBlock.appendChild(blockHeader);
        var ptrBlockHeader = document.getElementById(ID + 'Header');

        // create link for url and append to header
        var link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('target', 'blank');
        link.innerHTML = counter + ') ' + name;
        ptrBlockHeader.appendChild(link);


        counter++;
      //  ptrNewBlock.innerHTML = data.list[row].description;
    }
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