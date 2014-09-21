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
        color: '#fff', // #rgb or #rrggbb or array of colors
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

var geocoder = (function() {

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
            spotRadius = 50,
            opacity = 0.5,
            IsDissipating = true,
            heatmapNegative,
            heatmapPositive,
            moodsData = [];

        var createNegativeHeatMap = function(moodsData, map) {

            var gradient = [
                'rgba(0, 255, 255, 0)',
                '#ff0000'
            ];

            var pointArray = new google.maps.MVCArray(moodsData);

            heatmapNegative = new google.maps.visualization.HeatmapLayer({
                data: pointArray,
                radius: spotRadius,
                dissipating: IsDissipating,
                opacity: opacity
            });

            heatmapNegative.set('gradient', heatmapNegative.get('gradient') ? null : gradient);
            heatmapNegative.setMap(map);

            var addPoint = function(item) {
                console.log(item);
                pointArray.push(item);
            };

            return {
                addPoint: addPoint
            };


        };

        var createPositiveHeatMap = function(moodsData, map) {

            var gradient = [
                'rgba(0, 255, 255, 0)',
                '#00ff00'
            ];

            var pointArray = new google.maps.MVCArray(moodsData);

            heatmapPositive = new google.maps.visualization.HeatmapLayer({
                data: pointArray,
                radius: spotRadius,
                dissipating: IsDissipating,
                opacity: opacity
            });

            heatmapPositive.set('gradient', heatmapPositive.get('gradient') ? null : gradient);
            heatmapPositive.setMap(map);

            var addPoint = function(item) {
                console.log(item);
                pointArray.push(item);
            };

            return {
                addPoint: addPoint
            };
        };

        // var updatePositive = function(newTweet) {
        //     console.log(newTweet);
        //     console.log('heatmapPositive.data', heatmapPositive.data);
        //     heatmapPositive.setData(newTweet);
        // }


        var createGoogleMap = function(containerId) {

            var options = {
                zoom: 5,
                center: defaultLocation,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            map = buildMap(containerId, options);

            var styles = [{
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#000000"
                }, {
                    "lightness": 17
                }]
            }, {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#000000"
                }, {
                    "lightness": 20
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#000000"
                }, {
                    "lightness": 17
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "color": "#000000"
                }, {
                    "lightness": 29
                }, {
                    "weight": 0.2
                }]
            }, {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#000000"
                }, {
                    "lightness": 18
                }]
            }, {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#000000"
                }, {
                    "lightness": 16
                }]
            }, {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#000000"
                }, {
                    "lightness": 21
                }]
            }, {
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "visibility": "on"
                }, {
                    "color": "#000000"
                }, {
                    "lightness": 16
                }]
            }, {
                "elementType": "labels.text.fill",
                "stylers": [{
                    "saturation": 36
                }, {
                    "color": "#000000"
                }, {
                    "lightness": 40
                }]
            }, {
                "elementType": "labels.icon",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#000000"
                }, {
                    "lightness": 19
                }]
            }, {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#000000"
                }, {
                    "lightness": 20
                }]
            }, {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "color": "#000000"
                }, {
                    "lightness": 17
                }, {
                    "weight": 1.2
                }]
            }];

            map.setOptions({
                styles: styles
            });

            return map;
        };

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
            createPositiveHeatMap: createPositiveHeatMap
        };
    }
}());

(function() {

    var positive = [],
        negative = [];

    var map = googleMap.create('map-canvas');
    spinnerModule.showSpinner('spinner');

    // var url = 'http://api.openweathermap.org/data/2.1/find/station?lat=55&lon=37&cnt=10';

    var mainForm = $("#searchform");
    mainForm.submit(function(e) {
        e.preventDefault();
        var location = $("#location", mainForm).val() + ', UK';
        var subject = $("#subject", mainForm).val();
        console.log("geocoding " + location);

        doingSearch = true;

        if (location) {
            geocoder.geocode(location, function(position) {
                console.log(position);
                search(subject, position);
            });
        }
    });

    var initLiveData = function() {

        var ph = googleMap.createPositiveHeatMap(positive, map);
        var nh = googleMap.createNegativeHeatMap(negative, map);

        var socket = io('http://sentimentanalyser.azurewebsites.net:80');
        socket.on('livetweet', function(tweet) {
            if (!doingSearch) {
                var myLatlng = new google.maps.LatLng(tweet.loc[0], tweet.loc[1]);
                // console.log('tweet', tweet);

                if (tweet.mood.score > 0) {

                    ph.addPoint({
                        location: myLatlng,
                        weight: Math.abs(tweet.mood.score)
                    })

                } else {
                    nh.addPoint({
                        location: myLatlng,
                        weight: Math.abs(tweet.mood.score)
                    })
                };
            }
        });
    }

    var doingSearch = false;
    initLiveData();

    var search = function(searchTerm, location) {

        var url = 'http://sentimentanalyser.azurewebsites.net/search/' + searchTerm + '/' + location.lat + '/' + location.lng;

        map.setCenter(new google.maps.LatLng(location.lat, location.lng));
        map.setZoom(13);

        console.log(url);

        dataModule.getData(url, function(data) {

            console.log(data);
            spinnerModule.hideSpinner();

            for (var i = data.points.length - 1; i >= 0; i--) {

                if (data.points[i].mood > 0) {
                    positive.push({
                        location: new google.maps.LatLng(data.points[i].loc[0], data.points[i].loc[1]),
                        weight: Math.abs(data.points[i].mood) + 100
                    });
                } else {
                    negative.push({
                        location: new google.maps.LatLng(data.points[i].loc[0], data.points[i].loc[1]),
                        weight: Math.abs(data.points[i].mood) + 100
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
    }

})();