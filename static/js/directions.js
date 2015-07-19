

(function(){ // scope of directions info
    var steps = [];
    var travelMode;					// TRANSIT, DRIVING, WALKING
    var destinationName;			// ex. Cathedral of Learning
    var destinationID;

    $(document).on("click", '.GetDirections', function() {
        destinationID = $(this).attr('id');
        destinationID = destinationID.substring(0, destinationID.length - 13);
        var latitude = $('#' + $(this).attr('id') + 'Latitude').attr('value');
        var longitude = $('#' + $(this).attr('id') + 'Longitude').attr('value');
        var latlng = new google.maps.LatLng(latitude, longitude);
        var transitType = $('#transitType').val();
        getDirections(latlng, transitType);

    });

    $(document).on("click",'#saveDirections',function(){
        travelMode = $('#transitType').val();
        saveDirections();
    })

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
                var currStep;
                var descriptionText; 						// step instructions: ex. head northwest onto springtide pl
                var transitText = '';
                for(var i=0; i< route.steps.length; i++)
                {

                	var step = {};														// step object containing data for step. to be saved into steps array. so we can save directions later on
                	currStep = route.steps[i];

                    // parse step info
                    // save variables into step object which will then be stored globally in steps[]
                    step['durationText'] = currStep.duration.text;                              // duration of step, ex: 5 min
                    step['distanceText'] = currStep.distance.text;                              // distance of step, ex: 1mile
                    step['description'] = currStep.instructions;                                //  Bus towards Inbound-FREEPORT ROAD TO PITTSBURGH
                    step['travel_mode'] = currStep.travel_mode;									// WALKING, DRIVING, TRANSIT
                    step['lat'] = currStep.start_location.A;
                    step['lng'] = currStep.start_location.F;
                    step['order'] = i;

                    //printJSON(step);


                    // this step's transporation is TRANSIT
                    if(step['travel_mode'] == 'TRANSIT')
                    {
                        // parse json to get transit info
                        step['bus_agency'] = currStep.transit.line.agencies[0].name;             // port authority
	                    step['bus_name'] = currStep.transit.line.name;                           // monroeville
	                    step['bus_id'] = currStep.transit.line.short_name;                       // 64
	                    step['arrival_location'] = currStep.transit.arrival_stop.name;           // where the bus will pick you up
	                    step['arrival_time'] = currStep.transit.arrival_time.text;               // when the bus will drop you off at destination
	                    step['departure_location'] = currStep.transit.departure_stop.name;       // where the bus will drop you off
	                    step['departure_time'] = currStep.transit.departure_time.text;           // when bus will pick you up
                        descriptionText =  '<span class="header">Bus: </span>' + step['bus_id'] + ' - ' + step['bus_name'] + ' - ' + step['description'] + '<br/>' +
                                       '<span class="header">' + step['departure_time'] + '</span>: ' +  step['departure_location'] + '<br/>' +
                                       '<span class="header">' + step['arrival_time'] + '</span>: ' + step['arrival_location'];

                    }
                    else // walking or driving does not have departure time
                    {
                        step['departure_time'] = 'undefined';
                        descriptionText = step['description'];
                    }


                    /*
                        CREATE HTML STEP BLOCKS
                    */
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
                    if(step['travel_mode'] == 'WALKING'){
                        directionImg.src = '../static/images/walking.png';
                    }else if(step['travel_mode'] == 'DRIVING'){
                        directionImg.src = '../static/images/car.png';
                    }else{
                        directionImg.src = '../static/images/bus.png';
                    }

                    var innerLeftTextOne = document.createElement('div');
                    innerLeftTextOne.className = 'innerLeftText';
                    // there's no departure time for walking or driving
                    if(step['departure_time'] == 'undefined')
                    {
                        if(step['travel_mode'] == 'WALKING'){
                            innerLeftTextOne.innerHTML = 'Walk for about';
                        }
                        else if(step['travel_mode'] == 'DRIVING'){
                            innerLeftTextOne.innerHTML = 'Drive for about';
                        }

                    }else{
                        innerLeftTextOne.innerHTML = 'Bus arrives at ' + step['departure_time'];
                    }

                    var innerLeftTextTwo = document.createElement('div');
                    innerLeftTextTwo.className = 'innerLeftText';
                    innerLeftTextTwo.innerHTML = step['durationText'] + ', ' + step['distanceText'] ;

                    var agency = document.createElement('div');
                    agency.className = 'agency';
                    if(step.travel_mode == 'TRANSIT'){
                        agency.innerHTML = '<span class="header">' + step['bus_agency'] + '</span>';
                    }else if(step.travel_mode == 'WALKING'){
                        agency.innerHTML = '<span class="header">Walking</span>';
                    }else if(step.travel_mode == 'DRIVING'){
                        agency.innerHTML = '<span class="header">Driving</span>';
                    }


                    var innerRight = document.createElement('innerRight');
                    innerRight.className = 'innerRight';
                    innerRight.innerHTML = descriptionText;
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

                    // save step into steps array
                    steps.push(step);

                }

            }
        });


    }




    function saveDirections()
    {
    	var data = {};
	    data['steps'] = steps;
	    data['destinationID'] = destinationID;
	    data['travelMode'] = travelMode;

	    $.ajax({
	        type: 'POST',
	        url: 'http://tripplanner.pythonanywhere.com/saveDirections',
	        dataType:'json',
	        contentType: "application/json",
	        //data: JSON.stringify(data),
	        data: JSON.stringify(data),
	        success: function(data) {
	           alert(data['message']);
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



})(); // end of scope of directions info