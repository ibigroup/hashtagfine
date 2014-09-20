'use strict';

var spinnerModule = (function() {

    var opts = {
        lines: 13, // The number of lines to draw
        length: 5, // The length of each line
        width: 3, // The line thickness
        radius: 10, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#666', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto' // Left position relative to parent in px
    };

    var spinner = new Spinner(opts);

    function showSpinner(target) {
        return spinner.spin(document.getElementById(target));
    }

    function hideSpinner() {
        return spinner.stop();
    }

    return {
        showSpinner: showSpinner,
        hideSpinner: hideSpinner
    };

})();

var dataModule = (function() {

    function getData(url, callback) {

        $.ajax({
            dataType: 'jsonp',
            url: url,
            success: function(data) {
                callback(data);
            }
        });
    }

    return {
        getData: getData
    };

})();

var googleMap = (function() {

    if (typeof(google) !== 'undefined') {

        var map,
            service,
            infoWindow = new google.maps.InfoWindow(),
            defaultLocation = new google.maps.LatLng(52.486243,-1.890401);

        var createGoogleMap = function(containerId) {

            var options = {
                zoom: 13,
                center: defaultLocation,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            map = buildMap(containerId, options);
        };

        // var createMarker = function(place) {
        //     var marker = new google.maps.Marker({
        //         map: map,
        //         position: new google.maps.LatLng(place.Latitude, place.Longitude),
        //         icon: 'data:image/png;base64,..'
        //     });

        //     google.maps.event.addListener(marker, 'click', function() {
        //         infoWindow.setContent(place.Name);
        //         infoWindow.open(map, this);
        //     });
        // };

        var move = function(latitude, longitude) {
            var pos = new google.maps.LatLng(latitude, longitude);
            map.setCenter(pos);
        };

        var buildMap = function(containerId, options) {
            return new google.maps.Map(document.getElementById(containerId), options);
        };
        return {
            create: createGoogleMap,
            move: move
        };
    }
}());

(function() {

    googleMap.create('map-canvas');

    // spinnerModule.showSpinner('data');

    // var url = 'http://api.openweathermap.org/data/2.1/find/station?lat=55&lon=37&cnt=10';

    // dataModule.getData(url, function(data) {
    //     spinnerModule.hideSpinner();
    //     console.log(data);

    //     var append = '<span>Data retrieved: ' + data.cod + ' </span>';

    //     $('#data').html(append);

    // });

})();