var locations = [
    ['Manly Beach', -33.80010128657071, 151.28747820854187, 2],
    ['Bondi Beach', -33.890542, 151.274856, 4],
    ['Coogee Beach', -33.923036, 151.259052, 5],
    ['Maroubra Beach', -33.950198, 151.259302, 1],
    ['Cronulla Beach', -34.028249, 151.157507, 3]
];
function initMap() {
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: new google.maps.LatLng(-33.92, 151.25),
        // mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    directionsDisplay.setMap(map);
    var request = {
        travelMode: google.maps.TravelMode.DRIVING
    };
    var marker, i;
    for (i = 0; i < locations.length; i++) {
        var latlng = new google.maps.LatLng(locations[i][1], locations[i][2]);
        marker = new google.maps.Marker({
            position: latlng,
            map: map,
            label: "A",
        });
        if (i == 0) request.origin = marker.getPosition();
        else if (i == locations.length - 1) request.destination = marker.getPosition();
        else {
            if (!request.waypoints) request.waypoints = [];
            request.waypoints.push({
                location: marker.getPosition(),
                stopover: true
            });
        }
    }
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
        }
    });
    //var marker = new google.maps.Marker({
    //  position: uluru,
    //  map: map,
    //});
    //var markers = locations.map(function (location, i) {
    //    alert(location);
    //    return new google.maps.Marker({
    //        position: location,
    //        label: "A",
    //    });
    //});

    // Add a marker clusterer to manage the markers.
    //var markerCluster = new MarkerClusterer(map, markers,
    //    { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
}