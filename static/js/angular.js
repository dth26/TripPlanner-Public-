

var tripplanner = angular.module('trip', []);

tripplanner.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}]);


/*
Local scope:
    response: json object containing directions info
Arguments:
    data: json object containing destinations info
    index: index of current destination
    stop: total number of destinations, base case
    destinations: stores each destination containing destination info + distance/duration
    durations: contains duration of every destination, used for ordering destination blocks
*/
tripplanner.controller('destinationBlockCtrl', function($scope, $http){
    $http.get('http://tripplanner.pythonanywhere.com/getDestinations').success(function(data){
        var temp = {};
        var durations = [];
        var destinations = [];

        $scope.$apply(function(){
            $scope.destinations = [];
        });

        //destinations = createBlock(0, data.list.length, data.list, temp);
        $scope.createBlock(0, data.list.length-1, data.list, temp, durations);
    });

    $scope.createBlock = function(index,stop,data,destinations, durations){

        if(index == stop)
        {
            durations.sort(function(a,b){return a - b});

            for(var z=0; z<index; z++){
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

        var distanceService = new google.maps.DistanceMatrixService();;

        var directionrequest =
        {
            origins:  [new google.maps.LatLng(40.456110100000004,-79.9474358)],
            destinations: [new google.maps.LatLng(destinationInfo.latitude, destinationInfo.longitude)],
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            travelMode: google.maps.TravelMode.DRIVING
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
                stop--;
            }
            else if(response.rows[0].elements[0].status == "OVER_QUERY_LIMIT")
            {
                alert(name + ' ' + status);
                console.log('OVER_QUERY_LIMIT');
            }

            $scope.createBlock(index+1,stop,data,destinations, durations);

        });

    }
});



function printJSON(json){
    alert(JSON.stringify(json, null, 2));
    console.log(JSON.stringify(json, null, 2));
}
