$(document).ready(function(){

});


(function(){ // scope of directions info
    // variables for current destination selected
    var steps = [];
    var travelMode;					// TRANSIT, DRIVING, WALKING
    var destinationName;			// ex. Cathedral of Learning
    var destinationID;
    var directionID;
    var total_distance;             // total distance of route
    var total_duration;             // total duration of route
    var start_address;              // start address of route
    var end_address;                // end address of route


    // get saved directions
    $(document).on("click", '#getSavedDirections',function(e) {
        e.preventDefault();
        destinationName = $('#directionsFor').val();                 // destination the user wants to get the directions for
        var splice_index = destinationName.indexOf(' (');
        destinationName = destinationName.substring(0, splice_index);
        directionID = $('#directionsFor').find('option:selected').attr('id');
        getSavedDirections(parseInt(directionID));

    });

    $(document).on("click", '.GetDirections', function() {
        destinationID = $(this).attr('id');
        destinationID = destinationID.substring(0, destinationID.length - 13);
        destinationName = $('#' + destinationID + 'destinationNameInput').attr('value');
        var latitude = $('#' + $(this).attr('id') + 'Latitude').attr('value');
        var longitude = $('#' + $(this).attr('id') + 'Longitude').attr('value');
        var latlng = new google.maps.LatLng(latitude, longitude);
        var transitType = $('#transitType').val();
        getDirections(latlng, transitType);

    });

    $(document).on("click",'#saveDirections',function(){
        // if no directions are available to save return
        if($('#directionInfoDiv').length == 0){
            alert("Sorry. No directions to save! (Click the map pin by the destination)");
            return;
        }

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

                // save directions info
                total_distance = route.distance.text;            // total distance of route
                total_duration = route.duration.text;            // total duration of route
                start_address = route.start_address;             // start address of route
                end_address = route.end_address;                 // end address of route

                // display directions to screen
                createDirectionBlock(route);

                // remove current text
	            $('#directionInfoDiv').remove();

                var directionInfoDiv = document.createElement('div');
                directionInfoDiv.id = 'directionInfoDiv';

                var directionInfoText = "Destination:   <span style=\"color:#4F629C\">" + destinationName + "</span><br/>" +
                                        "Start Address: <span style=\"color:#4F629C\">" + start_address + "</span><br/>" +
                                        "End Address:   <span style=\"color:#4F629C\">" + end_address + "</span><br/>" +
                                        "Distance:      <span style=\"color:#4F629C\">" + total_distance + "</span><br/>" +
                                        "Duration:      <span style=\"color:#4F629C\">" + total_duration + "</span><br/>";


                directionInfoDiv.innerHTML = directionInfoText;
                document.getElementById('form-group-data').appendChild(directionInfoDiv);
            }else{
                alert('google.maps.DirectionsStatus not okay');
            }
        });


    }

    function createDirectionBlock(route)
    {
         //alert(response.routes[0].legs[0].transit);
        // get individual steps
        /*
            say your going to cathedral from bouquet gardens
            step 1: turn left onto S.Bouquet Street
            step 2: turn right onto 5th Ave
            step 3: turn left onto Bigelow Blvd
        */
       //  printJSON(route);
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

            var innerLeftHeader = document.createElement('div');
            innerLeftHeader.className = 'innerLeftHeader';
            innerLeftHeader.id = i + 'innerLeftHeader';

            var innerLeftHeaderBlock = document.createElement('div');
            innerLeftHeaderBlock.className = 'innerLeftHeaderBlock';
            innerLeftHeaderBlock.innerHTML = step['order'];


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


            var innerRight = document.createElement('div');
            innerRight.className = 'innerRight';
            innerRight.innerHTML = descriptionText;
            innerRight.id = i + 'innerRight';
            innerRight.style.cssText = '';

            // append children to '#directions' block
           // centerHorizontally.appendChild(directionImg);
            centerHorizontally.appendChild(innerLeftTextOne);
            centerHorizontally.appendChild(innerLeftTextTwo);
            centerHorizontally.appendChild(agency);

            innerLeft.appendChild(centerHorizontally);
            innerLeftHeader.appendChild(innerLeftHeaderBlock);
            innerLeftHeader.appendChild(directionImg);
            subBlock.appendChild(innerLeftHeader);
            subBlock.appendChild(innerLeft);
            subBlock.appendChild(innerRight);
            document.getElementById('directions').appendChild(subBlock);


            // set height of divs after elements are appended and rendered
            var innerLeftHeight = $('#' + i + 'innerLeft').height();
            var innerRightHeight = $('#'+i + 'innerRight').height();
            var maxHeight = (innerLeftHeight > innerRightHeight ? innerLeftHeight : innerRightHeight);

            $('#' + i + 'innerLeft').css('height',maxHeight);
            $('#' + i + 'innerRight').css('height',maxHeight);
            $('#' + i + 'innerLeft').css('height',maxHeight);
            $('#' + i + 'innerLeftHeader').css('height',maxHeight);

            // save step into steps array
            steps.push(step);

        }
    }

    function getSavedDirections(directionID)
    {
        var data = {};
        data['directionID'] = parseInt(directionID);

         // remove all previous directions before getting new
        $('#directions').empty();

        // now get directions json data from server
        $.ajax({
	        type: 'POST',
	        url: 'http://tripplanner.pythonanywhere.com/getDirectionsForDestination',
	        dataType:'json',
	        contentType: "application/json",
	        data: JSON.stringify(data),
	        //data: JSON.stringify(data),
	        success: function(data) {

	            // remove current text
	            $('#directionInfoDiv').remove();

                var directionInfoDiv = document.createElement('div');
                directionInfoDiv.id = 'directionInfoDiv';

                var directionInfoText = "Destination:   <span style=\"color:#4F629C\">" + destinationName + "</span><br/>" +
                                        "Start Address: <span style=\"color:#4F629C\">" + data.directionsInfo['start_address'] + "</span><br/>" +
                                        "End Address:   <span style=\"color:#4F629C\">" + data.directionsInfo['end_address'] + "</span><br/>" +
                                        "Distance:      <span style=\"color:#4F629C\">" + data.directionsInfo['total_distance'] + "</span><br/>" +
                                        "Duration:      <span style=\"color:#4F629C\">" + data.directionsInfo['total_duration'] + "</span><br/>";


                directionInfoDiv.innerHTML = directionInfoText;
                document.getElementById('form-group-data').appendChild(directionInfoDiv);
	            createDirectionBlock(data);
	        },
	        error: function(jqXHR, exception) {
	            alert('exception: ' + exception +'\njqXHR: ' + jqXHR.status);
	            console.log('exception: ' + exception +'\njqXHR: ' + jqXHR.status);
		    }
    	});
    }


    function saveDirections()
    {
        var data = {};
	    data['steps'] = steps;
	    data['destinationID'] = destinationID;
	    data['travelMode'] = travelMode;
	    data['total_distance'] = total_distance;
	    data['total_duration'] = total_duration;
	    data['start_address'] = start_address;
	    data['end_address'] = end_address;

        $.ajax({
	        type: 'POST',
	        url: 'http://tripplanner.pythonanywhere.com/saveDirections',
	        dataType:'json',
	        contentType: "application/json",
	        //data: JSON.stringify(data),
	        data: JSON.stringify(data),
	        success: function(data) {
	           alert(data['message']);
	           // reset steps
	           steps = [];
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


function printJSON(json){
    alert(JSON.stringify(json, null, 2));
    console.log(JSON.stringify(json, null, 2));
}