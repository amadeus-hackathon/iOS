Aria.tplScriptDefinition({
    $classpath: "app.templates.DetailsLayoutScript",
    $constructor: function () {},
    $prototype: {
        $dataReady: function () {
            this.data.events = [1, 2, 3];
            this.data.packages = json.details.packages;
						 
			this.data.clickedCity = json.details.clickedCityDetails;
						 
			this.data.details = json.details.clickedCityDetails.desc;
			this.data.placeImage = json.details.clickedCityDetails.imageID;
            this.data.placetitle = json.details.clickedCityDetails.cityName;
        },

        $displayReady: function () {

            var detTpl = this;

            //PASS THE LAT & LON from HERE
            //Pass Catogery also
						 
			this.initialize(this.data.clickedCity.lat, this.data.clickedCity.lng);
						 
            // create iscroll
            detTpl.data.myScroll = new iScroll('wrapper');
            document.addEventListener('touchmove', function (e) {
                e.preventDefault();
            }, false);

            // reset scroller on orientation change
            $(window).bind('orientationchange', function () {
                detTpl.data.myScroll.refresh();
            });

            // reset UI
            this.hidePopup();
            this.packageClicked();
        },

        packageClicked: function (event, args) {
            $("#eventslist").hide();
            $("#packageList").show();
            $("#packages").addClass("selected");
            $("#events").removeClass("selected");
            this.data.myScroll.refresh()
        },

        eventClicked: function (event, args) {
            $("#eventslist").show();
            $("#packageList").hide();
            $("#packages").removeClass("selected");
            $("#events").addClass("selected");
            this.data.myScroll.refresh()
        },

        showPopup: function (event, args) {

            // get currency element
            var popEl = document.getElementById('popCurrency');
            if (popEl != null) {
				popEl.innerHTML = "INR " + args.pc;
			}
			
			// get hotel name element
            var hotelEL = document.getElementById('hotelEL');
            if (hotelEL != null) {
				hotelEL.innerHTML = args.nm;
			}
			
            // show popup
            $(".popup2, .mask").show();
        },

        hidePopup: function (event, args) {
            $(".popup2, .mask").hide();
        },

        initialize: function (myLat, myLng) {
            //Health & Wellness - doctor|health|hospital|dentist
            //Religion & Spirtuality - hindu_temple|place_of_worship|mosque
            //Vacation | Exotic Vacations | New Places | Kids & family | Social Networking |Others - airport|bus_station|car_rental|taxi_stand|train_station
            //Sports | Adventures | Rest & relaxation - gym|spa

            var category = "doctor|health|hospital|dentist|airport|bus_station|car_rental|taxi_stand|train_station|hindu_temple|place_of_worship|mosque";
            var mapOptions = {
                zoom: 10,
                center: new google.maps.LatLng(myLat, myLng),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + myLat + "," + myLng + "&radius=500&types=" + category + "&sensor=false&key=AIzaSyA9OSfNLkuIV2pAJgXJVKzL3N68Eefdqyc";
            $.ajax({
                url: url,
                cache: false,
                type: "POST",
                processData: false,
                dataType: "json",
                crossDomain: "true",
                complete: function (responseData, textStatus, jqXHR) {
                    if (textStatus == "success") {
                        var resp = JSON.parse(responseData.responseText);
                        //	alert('venkat'+resp.results.length);
                        for (var i = 0; i < resp.results.length; i++) {
                            //	alert(resp.results[i].name);
                            //alert(resp.results[i].vicinity);
                            //	alert(resp.results[i].geometry.location.lat);
                            var lat = resp.results[i].geometry.location.lat;
                            var lng = resp.results[i].geometry.location.lng;
                            var title = resp.results[i].name;
                            var desc = resp.results[i].vicinity;

                            var contentString = '<div id="content">' +
                                '<div id="siteNotice">' +
                                '</div>' +
                                '<p><b>' +
                                title +
                                '</b><p>' +
                                desc +
                                '</div>' +
                                '</div>';

                            var infowindow = new google.maps.InfoWindow({
                                content: contentString
                            });

                            var marker = new google.maps.Marker({
                                position: new google.maps.LatLng(lat, lng),
                                map: map,
                                title: title
                            });
                            google.maps.event.addListener(marker, 'click', function (marker, infowindow) {
                                return function () {
                                    infowindow.open(map, marker);
                                }
                            }(marker, infowindow));


                        }

                        //Response data
                    } else {
                        alert("FAILED IF");
                    }
                },
                error: function (responseData, textStatus, errorThrown) {
                    console.log('POST failed.');
                    alert("FAILEDS API CALL");
                }
            });

        },
		
		getDecodedText: function(data) {
			
			// format text
			while (data.indexOf('+') != -1) {
				data = data.replace('+', ' ');
			}
			
			while (data.indexOf('%') != -1) {
				data = data.replace('%', '');
			}
			
			return decodeURI(data);
		}
    }
})