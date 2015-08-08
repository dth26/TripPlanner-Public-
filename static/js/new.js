

tripplanner.controller('newCtrl', function($scope, $http){

    var geocoder = new google.maps.Geocoder();

    $scope.submitManual = function(){
        var address = $('input[name="Address"]').val().trim();
        var description =  $('textarea#descrptionIn').val();
        var name = $('input[name="Name"]').val().trim();
        var url = $('input[name="URL"]').val().trim();

        document.getElementById("nameIn").value = "";
        document.getElementById("addressIn").value = "";
        document.getElementById("URLin").value = "";
        document.getElementById("descrptionIn").value = "";

        $scope.addDestination(name, description, address, url);

    }


    $scope.submitYelp = function(){
        var url = $('input[name="yelpURL"]').val().trim();
        $('#URLYelpIn').value = "";

        // scrape url and get address, and other infro for destination from yelp

        $.getJSON('/scrapeYelp',{
            url: url
        }).done(function(data){
            var address = data.address + ', ' + data.city + ', ' + data.state + ' ' + data.zip;
            $scope.addDestination(data.name, data.category, address, url);
        }).fail(function(error){
            alert(error.status);
        });


    }


    $scope.addDestination = function(name, description, address, url){
        // geocoder gets the geographical coordinates of the address
        geocoder.geocode({'address' : address}, function(results, status){

            if (status == google.maps.GeocoderStatus.OK) {
                var coordinates = {}
                coordinates['latitude'] = results[0].geometry.location.lat();
                coordinates['longitude'] = results[0].geometry.location.lng();

                // send data to server and store data
                $.getJSON('/newDestination', {
                    Name: name,
                    Description: description,
                    Address: address,
                    URL: url,
                    Latitude: coordinates['latitude'],
                    Longitude: coordinates['longitude']
                }).done(function(data) {
                    alert(data.name + " was successfully created!");

                    var scope = angular.element(document.getElementById("destinationBlockCtrl")).scope();
                    scope.getDestinations($('#transitType').val());

                }).fail(function(error) {
                    alert(error.status);
                });
            }
            else
            {
                alert('Geocode was not successful for the following reason: ' + status);
            }

        });
    }



});

function printJSON(json){
    alert(JSON.stringify(json, null, 2));
    console.log(JSON.stringify(json, null, 2));
}



