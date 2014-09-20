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
        top: '', // Top position relative to parent in px
        left: '' // Left position relative to parent in px
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
            // dataType: 'jsonp',
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

var geocoder = (function(){
    
    var geocode = function(location, callback) {
            var requestUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + location + "&sensor=false";
            var request = $.ajax({
                dataType: "json",
                url: requestUrl
            });

            request.done(function(data) {
                if (data.results && data.results.length > 0) {
                    var location = data.results[0].geometry.location;
                    callback(location);
                }
            });
    };

    return {
        geocode: geocode
    };

}());

var googleMap = (function() {

    if (typeof(google) !== 'undefined') {

        var map,
            service,
            infoWindow = new google.maps.InfoWindow(),
            defaultLocation = new google.maps.LatLng(52.486243, -1.890401),
            pointarray,
            heatmapNegative,
            heatmapPositive,
            moodsData = [];

        var getCircle = function(mood, circle) {

            var mainColor = '#bb0';

            var circle = {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: 'yellow',
                fillOpacity: 0.8,
                scale: 10,
                strokeColor: 'gold',
                strokeWeight: 1
            };

            if (mood === -2) {
                circle.fillColor = '#BB6D00';
                circle.strokeColor = '#BB6D00';
            } else if (mood === -1) {
                circle.fillColor = '#ABBB00';
                circle.strokeColor = '#ABBB00';
            } else if (mood === -0) {
                circle.fillColor = '#51BB00';
                circle.strokeColor = '#51BB00';
            } else if (mood === 1) {
                circle.fillColor = '#00BB70';
                circle.strokeColor = '#00BB70';
            } else if (mood === 2) {
                circle.fillColor = '#00A2BB';
                circle.strokeColor = '#00A2BB';
            } else if (mood === 3) {
                circle.fillColor = '#05CAE8';
                circle.strokeColor = '#05CAE8';
            }

            return circle;
        }

        var createNegativeHeatMap = function(moodsData, map) {

            var gradient = [
                'rgba(0, 255, 255, 0)',
                '#ff0000'
            ];

            var pointArray = new google.maps.MVCArray(moodsData);

            heatmapNegative = new google.maps.visualization.HeatmapLayer({
                data: pointArray,
                radius: 20,
                // opacity: 1
            });

            heatmapNegative.set('gradient', heatmapNegative.get('gradient') ? null : gradient);
            heatmapNegative.setMap(map);
        };

        var createPositiveHeatMap = function(moodsData, map) {

            var gradient = [
                'rgba(0, 255, 255, 0)',
                '#00ff00'
            ];

            var pointArray = new google.maps.MVCArray(moodsData);

            heatmapPositive = new google.maps.visualization.HeatmapLayer({
                data: pointArray,
                radius: 15,
                // opacity: 1
            });

            heatmapPositive.set('gradient', heatmapPositive.get('gradient') ? null : gradient);
            heatmapPositive.setMap(map);
        };

        var createGoogleMap = function(containerId) {

            var options = {
                zoom: 13,
                center: defaultLocation,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            map = buildMap(containerId, options);

            var styles = [{
                stylers: [{
                    hue: "#00ffe6"
                }, {
                    saturation: -20
                }]
            }, {
                featureType: "road",
                elementType: "geometry",
                stylers: [{
                    lightness: 100
                }, {
                    visibility: "simplified"
                }]
            }, {
                featureType: "road",
                elementType: "labels",
                stylers: [{
                    visibility: "off"
                }]
            }];

            map.setOptions({
                styles: styles
            });

            return map;
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
            move: move,
            createNegativeHeatMap: createNegativeHeatMap,
            createPositiveHeatMap: createPositiveHeatMap,
            getCircle: getCircle
        };
    }
}());

(function() {

    var map = googleMap.create('map-canvas');
    spinnerModule.showSpinner('spinner');

    // var url = 'http://api.openweathermap.org/data/2.1/find/station?lat=55&lon=37&cnt=10';
    // var url = 'http://sentimentanalyser.azurewebsites.net/q/everything';
    var url = 'http://sentimentanalyser.azurewebsites.net/test';

    var mainForm = $("#searchform");
    mainForm.submit(function(e) {
       e.preventDefault();
       var location = $("#location", mainForm).val();
       console.log("geocoding " + location);

       if (location) {
            geocoder.geocode(location, function(position) {
                console.log(position);
            });  
       }
    });

    dataModule.getData(url, function(data) {
        spinnerModule.hideSpinner();

        var append = '<span>General mood for: ' + data.name + ' is ' + data.mood + '</span>';

        $('#data').html(append);

        console.log(data);
        var positive = [],
            negative = [];

        for (var i = data.points.length - 1; i >= 0; i--) {

            if (data.points[i].mood > 0) {
                positive.push({
                    location: new google.maps.LatLng(data.points[i].loc[0], data.points[i].loc[1]),
                    weight: data.points[i].mood + 100
                });
            } else {
                negative.push({
                    location: new google.maps.LatLng(data.points[i].loc[0], data.points[i].loc[1]),
                    weight: data.points[i].mood + 1000
                });
            };
        };

        googleMap.createPositiveHeatMap(positive, map);
        googleMap.createNegativeHeatMap(negative, map);



        // for (var i = 0; i < data.points.length; i++) {

        //     // console.log(googleMap.getCircle(data.points[i].mood));

        //     var latLng = new google.maps.LatLng(data.points[i].loc[0], data.points[i].loc[1]);

        //     var marker = new google.maps.Marker({
        //         position: latLng,
        //         map: map,
        //         icon: googleMap.getCircle(data.points[i].mood)
        //     });
        // }


    });

})();