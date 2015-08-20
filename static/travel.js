
// Initialize Map but hidden until user submits form
$("#map-container").hide();

L.mapbox.accessToken = 'pk.eyJ1Ijoic3VzYW5jb2RlcyIsImEiOiJhMmIyNGY3ODljOWE5ODhmYzFhYWE4YzM3YzAwZjg5ZiJ9.fyRv1wgTMRJuH-v-orHx6w';
var mapLeaflet = L.mapbox.map('map-leaflet', 'susancodes.1e9ac8a5')
  .setView([37.8, -96], 4)

// must create a layer group so that I can wipe out the markers when user changes budget
var layerGroup = L.layerGroup().addTo(mapLeaflet);



// Style the marker icon
var myIcon = L.icon({
	iconUrl: '/static/img/airplane-icon.png',
	iconSize: [38, 95],
	iconAnchor: [22, 94],
	popupAnchor: [-3, -76],
});

mapLeaflet.scrollWheelZoom.disable();



function getFareResults(evt){
	showLoadingMessage();
	setTimeout(emptyFlashMessage, 3000);

	// preventing form submission
	evt.preventDefault();
	console.log("prevented default");


	// sending GET request to get form values
	var url = "/airfaresearch.json?origin=" + $("#airportcodes").val() + 
				"&earliest-departure-date=" + $("#early-depart-field").val() +
				"&latest-departure-date=" + $("#late-depart-field").val() +
				"&length-of-stay=" + $("#length-of-stay-field").val() +
				"&max-budget=" + $("#max-budget-field").val();
	// console.log(url)


	// // Making an ajax call to get the API response in PLAIN JSON
	// // THIS IS WORKING. DO NOT ERASE *****************************
	// $.get(url, function (data) {
	// 	var fareResults = data.results;
	// 	console.log(fareResults);
	// 	processFareResults(fareResults, mapLeaflet);
	// })



	// THIS IS CALLING GEOJSON - IT WORKS!!! DO NOT ERASE
	$.get(url, function (data) {
		var geojsonFeature = JSON.parse(data);
		console.log("geojsonFeature");
		console.log(geojsonFeature);
		debugger;

		layerGroup.clearLayers();

		var markers = new L.markerClusterGroup().addTo(layerGroup);

		var markerLayer = L.geoJson(geojsonFeature, {
			onEachFeature: 
			function onEachFeature(feature, layer) {
				
				var fare = feature.properties.fares;
				console.log("fare: " + fare);

				if (isNaN(fare[0].lowestFare) == false) {
					var lowestFare = fare[0].lowestFare;
					var lowestFareDep = fare[0].departureDateTime;
					var lowestFareRet = fare[0].returnDateTime;
				} else {
					var lowestFare = "NOT AVAILABLE";
					var lowestFareDep = "NOT AVAILABLE";
					var lowestFareRet = "NOT AVAILABLE";

				}

				// // THIS IS GIVING ME PROBLEMS.
				// if (isNaN(fare[0].lowestNonStopFare) == false) {
				// 	var lowestNonStopFare = fare[0].lowestNonStopFare;
				// 	var lowestNonStopFareDep = fare[0].departureDateTime;
				// 	var lowestNonStopFareRet = fare[0].returnDateTime;	
				// } else {
				// 	var lowestNonStopFare = "NOT AVAILABLE" ;
				// 	var lowestNonStopFareDep = "NOT AVAILABLE";
				// 	var lowestNonStopFareRet = "NOT AVAILABLE";	
				// }

				var fareArray = [['Date', 'Fare', 'NonStop Fare'], ];

				for (var f=0; f < fare.length; f++) {
				
					var date = fare[f].departureDateTime.slice(0,10);
					var dateLowFare = parseInt(fare[f].lowestFare);
					var dateLowNonStopFare = fare[f].lowestNonStopFare;

					fareArray.push([date, dateLowFare, dateLowNonStopFare]);

					// find the lowest fare
					// see if there's more than one result
					// if so, go through each day and compare with the lowestfare
					// if lower than current lowestfare, update it
					if (isNaN(fare[f].lowestFare) == false){
						if (10 < fare[f].lowestFare && fare[f].lowestFare < lowestFare) {
							lowestFare = fare[f].lowestFare;
							lowestFareDep = fare[f].departureDateTime;
							lowestFareRet = fare[f].returnDateTime;
						}
					}

					// if (isNaN(fare[f].lowestFare) == false){
					// 	if (10 < fare[f].lowestNonStopFare && fare[f].lowestNonStopFare < lowestNonStopFare) {
					// 		lowestNonStopFare = fare[f].lowestNonStopFare;
					// 		lowestNonStopFareDep = fare[f].departureDateTime;
					// 		lowestNonStopFareRet = fare[f].returnDateTime;
					// 	}
					// }

				}

				var popupContent = (
					'<div class="popup-content">' +
					'<p style="font-size: 20px"><font color="#3399ff"><b>' + feature.properties.city + '</b></p>' +
					'<p>(Airport: ' + feature.properties.id + ')</p></font>' +
					'<div class="lowestfarecontent"><p><b>Lowest Fare: </b>$' + parseInt(lowestFare) + '</p>' +
					'<p>Departure Date: ' + lowestFareDep.slice(0,10) + '</p>' +
					'<p>Return Date: ' + lowestFareRet.slice(0,10) + '</p><hr color="#3399ff">' +
					// '<p><b>Lowest NonStop Fare: </b>$' + parseInt(lowestNonStopFare) + '</p>' +
					// '<p>Departure Date: ' + lowestNonStopFareDep.slice(0,10) + '</p>' +
					// '<p>Return Date: ' + lowestNonStopFareRet.slice(0,10) + '</p></div>' +
					'<div id="curve_chart">' + "CHART HERE" + '</div>' +
					'</div>'
					);

				if (feature.properties) {
					layer.bindPopup(popupContent);
				}

			}
		})
		// adding the marker layer to the cluster group, which is in a group layer on our map
		markers.addLayer(markerLayer);
	})

		// When the map shows itself, it must readjust its size
		$("#map-container").show();
		mapLeaflet.invalidateSize();
}



function drawChart(fareArray) {
	var data = google.visualization.arrayToDataTable(fareArray);
	var options = {
		title: 'Fare Calendar',
		curveType: 'function',
		legend: {position: 'bottom'}
	};

	var chart = new google.visualization.LineChart($("#curve_chart"));
	chart.draw(data, options);	
}



$('#faresearchform').on('submit', getFareResults);

// $('#faresearchform').on('submit', searchCampsites);



// AUTOCOMPLETE

$(function() {
$("#airportcodes").autocomplete({
	source: function(request, response) {
		$.ajax({
			url: "/autocomplete",
			dataType: "json",
			data: {
				term: request.term
			}
		})
		.done(function(data) {
			response(data.data);
		})
	}
})
});

// SHOW ERROR MESSAGE FOR NO RESULTS

function showErrorMessage() {
	$("#flash-message").html("<br>You're too broke to fly. Consider a road trip.<br>");
}

function showLoadingMessage() {
	$("#flash-message").html("<br>Your BFF (budget flight finder) is hard at work. One moment please...</br>");
}

function emptyFlashMessage() {
	$("#flash-message").html("");
}

// $(document).ajaxError(function(){
// 	showErrorMessage();
// })


function searchCampsites(evt) {

	evt.preventDefault();
	console.log("prevented default");

	$("#map-container").show();
	mapLeaflet.invalidateSize();


	var url = "/campsitesearch?origin=" + $("#airportcodes").val()

	$.get(url, function (data){
		debugger;
		console.log(data.data);
		var campsiteResults = data.data;
		for (var i=0; i < campsiteResults.length; i++) {
			var lat = parseFloat(campsiteResults[i].latitude);
			var lon = parseFloat(campsiteResults[i].longitude);
			var marker = L.marker([lat,lon]).addTo(mapLeaflet);
			console.log(lat, lon)
		}
	})
	
}




