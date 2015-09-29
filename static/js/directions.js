

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


    tripplanner.controller('directionsListCtrl', function($scope,$http){

         $scope.getListOfSavedDirections = function(){

            $scope.destinationsList = [];

            $http.get('http://tripplanner.pythonanywhere.com/getListOfSavedDirections').success(function(data){
                var destinations = data['data'];

                for(var z=0; z<destinations.length; z++){
                    $scope.$apply(function(){
                        $scope.destinationsList.push(destinations[z]);
                    });
                }


            });
         }

    });

    tripplanner.controller('directionsCtrl', function($scope,$http){


        $scope.deleteDirections = function(){
            var directionID = $('#directionsFor').find('option:selected').attr('id');

            if(confirm('Delete Directions')){
                $http.get('http://tripplanner.pythonanywhere.com/deleteDirections', {
                    params: {
                        directionID: parseInt(directionID)
                    }
                }).success(function(){
                    $("#directionsFor option[id='" + directionID +"']").remove();
                });
            }
        }

        $scope.createDirectionBlock = function(route){
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

            $scope.directionBlocks = [];

            // reset steps
            steps = [];
            for(var i=0; i< route.steps.length; i++)
            {

            	var step = {};														// step object containing data for step. to be saved into steps array. so we can save directions later on
            	currStep = route.steps[i];

                // parse step info
                // save variables into step object which will then be stored globally in steps[]
                step['durationText'] = currStep.duration.text;                              // duration of step, ex: 5 min
                step['distanceText'] = currStep.distance.text;                              // distance of step, ex: 1mile
                step['travel_mode'] = currStep.travel_mode;									// WALKING, DRIVING, TRANSIT
                step['lat'] = currStep.start_location.G;
                step['lng'] = currStep.start_location.K;

                if(step['lat'] == undefined || step['lng'] == undefined){
                    step['lat'] = 0.0;
                    step['lng'] = 0.0;
                }

                //alert(currStep.start_location.A + ' ' +currStep.start_location.F);
                step['description'] = currStep.instructions;                                //  Bus towards Inbound-FREEPORT ROAD TO PITTSBURGH
                step['order'] = i;


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
                    step['descriptionText'] =  '<span class="header">Bus: </span>' + step['bus_id'] + ' - ' + step['bus_name'] + ' - ' + step['description'] + '<br/>' +
                                   '<span class="header">' + step['departure_time'] + '</span>: ' +  step['departure_location'] + '<br/>' +
                                   '<span class="header">' + step['arrival_time'] + '</span>: ' + step['arrival_location'];
                    step['short_description'] = 'Bus arrives at ' + step['departure_time'];
                    step['travel_description'] = step['bus_agency'];
                    step['imagePath'] = 'bus.png';
                }
                else if(step['travel_mode'] == 'WALKING')
                {
                    step['departure_time'] = 'undefined';
                    step['descriptionText'] =  step['description'];                         //  Bus towards Inbound-FREEPORT ROAD TO PITTSBURGH
                    step['short_description'] = 'Walk for about';
                    step['travel_description'] = 'Walking';
                    step['imagePath'] = 'walking.png';
                }
                else if(step['travel_mode'] == 'DRIVING')
                {
                    step['short_description'] = 'Drive for about';
                    step['travel_description'] = 'Driving';
                    step['departure_time'] = 'undefined';
                    step['descriptionText'] =  step['description'];                         //  Bus towards Inbound-FREEPORT ROAD TO PITTSBURGH
                    step['imagePath'] = 'car.png';
                }

                // remove tags from string step['descriptionText']
                var regex = /(<([^>]+)>)/ig
                ,   body = step['descriptionText']
                ,   result = body.replace(regex, "");
                step['descriptionText'] = result;

                $scope.$apply(function(){
                   $scope.directionBlocks.push(step);
                });



                steps.push(step);

                 // set height of divs after elements are appended and rendered
                var innerLeftHeight = $('#' + i + 'innerLeft').height();
                var innerRightHeight = $('#'+i + 'innerRight').height();
                var maxHeight = (innerLeftHeight > innerRightHeight ? innerLeftHeight : innerRightHeight);

                $('#' + i + 'innerLeft').css('height',maxHeight);
                $('#' + i + 'innerRight').css('height',maxHeight);
                $('#' + i + 'innerLeft').css('height',maxHeight);
                $('#' + i + 'innerLeftHeader').css('height',maxHeight);
            } // end for

        }
    });












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


        switchTab('mapItm');
        $('#directionsModal').modal('show');
        $("#directionsModal").draggable({
            handle: ".modal-header"
        });


        destinationID = $(this).attr('id');
        destinationID = destinationID.substring(0, destinationID.length - 13);
        destinationName = $('#' + destinationID + 'destinationNameInput').attr('value');
        var latitude = $('#' + $(this).attr('id') + 'Latitude').attr('value');
        var longitude = $('#' + $(this).attr('id') + 'Longitude').attr('value');
        var latlng = new google.maps.LatLng(latitude, longitude);
        var transitType = $('#transitType').val();
        jQuery('html,body').animate({scrollTop:0},0);
        getDirections(latlng, transitType);
    });

    $(document).on("click",'#saveDirections',function(){
        // if no directions are available to save return
        if(steps.length == 0){
            alert("Sorry. No directions to save! (Click the map pin by the destination)");
            return;
        }
             // printJSON(steps);
        alert('Click Okay and please wait a short moment for a success/failure confirmation!');
        travelMode = $('#transitType').val();
        saveDirections();

        var scope = angular.element(document.getElementById("directionsListCtrl")).scope();

        scope.$apply(function(){
              scope.getListOfSavedDirections();
        });

    });

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

                var scope = angular.element(document.getElementById("directionsCtrl")).scope();
                scope.createDirectionBlock(route);

                scope.$apply(function(){
                      scope.destinationName = destinationName;
                    scope.start_address = start_address;
                    scope.end_address = end_address;
                    scope.total_distance = total_distance;
                    scope.total_duration = total_duration;
                });

               // createDirectionBlock(route);

                // remove current text
	           // $('#directionInfoDiv').remove();

            //     var directionInfoDiv = document.createElement('div');
            //     directionInfoDiv.id = 'directionInfoDiv';

                // var directionInfoText = "Destination:   <span style=\"color:#4F629C\">" + destinationName + "</span><br/>" +
                //                         "Start Address: <span style=\"color:#4F629C\">" + start_address + "</span><br/>" +
                //                         "End Address:   <span style=\"color:#4F629C\">" + end_address + "</span><br/>" +
                //                         "Distance:      <span style=\"color:#4F629C\">" + total_distance + "</span><br/>" +
                //                         "Duration:      <span style=\"color:#4F629C\">" + total_duration + "</span><br/>";


                // directionInfoDiv.innerHTML = directionInfoText;

//directionInfoDiv
                // directions.html is included twice which means that the id 'directionsInfo' exists twice. So only one directionsInfo
                // will be populated
              //  document.getElementById('directionsInfo').appendChild(directionInfoDiv);
            }else{
                alert('google.maps.DirectionsStatus not okay');
            }
        });


    }


    function getSavedDirections(directionID)
    {
        var data = {};
       // alert('direcionID ' + directionID);
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
                //document.getElementById('directionsInfo').appendChild(directionInfoDiv);
	            var scope = angular.element(document.getElementById("directionsCtrl")).scope();
	            scope.$apply(function(){
                    scope.destinationName = destinationName;
                    scope.start_address = data['directionsInfo'].start_address;
                    scope.end_address = data['directionsInfo'].end_address;
                    scope.total_distance = data['directionsInfo'].total_distance;
                    scope.total_duration = data['directionsInfo'].total_duration;
                });

                scope.createDirectionBlock(data);
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

//toggle menu for destination list
$(document).ready(function () {
    $('#toggle-view li').click(function () {
        var text = $(this).children('div.panel');
        if (text.is(':hidden')) {
            text.slideDown('200');
            $(this).children('span').html('-');
        } else {
            text.slideUp('200');
            $(this).children('span').html('+');
        }

    });
});

function printJSON(json){
    alert(JSON.stringify(json, null, 2));
    console.log(JSON.stringify(json, null, 2));
}