$(document).ready(function(){
    // add new destination to database
     $('#submitIn').click(function(){
        var address = $('input[name="Address"]').val();
        var description =  $('input[name="Description"]').val();
        var name = $('input[name="Name"]').val();
        var url = $('input[name="URL"]').val();

        document.getElementById("nameIn").value = "";
        document.getElementById("addressIn").value = "";
        document.getElementById("URLin").value = "";
        document.getElementById("descrptionIn").value = "";

        // geocoder gets the geographical coordinates of the address
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address' : address}, function(results, status){

            if (status == google.maps.GeocoderStatus.OK) {
                console.log( "latitude : " + results[0].geometry.location.lat() );
                console.log( "longitude : " + results[0].geometry.location.lng() );
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
                }).fail(function(error) {
                    alert(error.status);
                });
            }
            else
            {
                alert('Geocode was not successful for the following reason: ' + status);
            }


        });
    });
});


