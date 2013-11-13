/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
		
//		navigator.splashscreen.show();
//		
//		setTimeout(function() {
//				   navigator.splashscreen.hide();
//				   }, 5000);

		try
		{
			FB.init({ appId: "750340128315217", nativeInterface: CDV.FB, useCachedDialogs: false });
		}
		catch (e)
		{
			alert(e.message);
		}
		
		navigator.geolocation.getCurrentPosition(app.onGeoLocationSuccess, app.onGeoLocationError);

			
    },
	onGeoLocationSuccess: function(position){
//		alert('Latitude: '          + position.coords.latitude          + '\n' +
//			  'Longitude: '         + position.coords.longitude         + '\n' +
//			  'Altitude: '          + position.coords.altitude          + '\n' +
//			  'Accuracy: '          + position.coords.accuracy          + '\n' +
//			  'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
//			  'Heading: '           + position.coords.heading           + '\n' +
//			  'Speed: '             + position.coords.speed             + '\n' +
//			  'Timestamp: '         + position.timestamp                + '\n');
		
		window.localStorage.setItem("gpsLat", position.coords.latitude);
		window.localStorage.setItem("gpsLng", position.coords.longitude);
		
		app.codeLatLng();
		
	},
	onGeoLocationError: function(error){
		alert('code: '    + error.code    + '\n' +
			  'message: ' + error.message + '\n');
	},
	codeLatLng: function() {
		
		var geocoder;
		geocoder = new google.maps.Geocoder();

		var gpsLat = window.localStorage.getItem("gpsLat");
		var gpsLng = window.localStorage.getItem("gpsLng");
		
		var latlng = new google.maps.LatLng(gpsLat, gpsLng);

		geocoder.geocode({'latLng': latlng}, function(results, status)
						 {
						 if (status == google.maps.GeocoderStatus.OK)
						 {
						 if (results[1])
						 {
                         var locationLength = results[1].address_components.length;
						 
                         for(var j = 0; j < locationLength; j++)
                         {
                         if(results[1].address_components[j].types[0] == "locality")
                         {
                         window.localStorage.setItem("currentCityName", results[1].address_components[j].long_name);
                         }
                         }
						 }
						 else
						 {
						 alert('No results found');
						 }
						 }
						 else
						 {
						 alert('Geocoder failed due to: ' + status);
						 }
						 });
	}
};
