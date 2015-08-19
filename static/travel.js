

// Initialize Map but hidden until user submits form
$("#map-container").hide();

L.mapbox.accessToken = 'pk.eyJ1Ijoic3VzYW5jb2RlcyIsImEiOiJhMmIyNGY3ODljOWE5ODhmYzFhYWE4YzM3YzAwZjg5ZiJ9.fyRv1wgTMRJuH-v-orHx6w';
var mapLeaflet = L.mapbox.map('map-leaflet', 'susancodes.1e9ac8a5')
  .setView([37.8, -96], 4)

var layerGroup = L.layerGroup().addTo(mapLeaflet);

var markerLayer = L.mapbox.featureLayer().addTo(mapLeaflet)




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

		console.log("TRYING TO GET FARES OBJECT");
		console.log(geojsonFeature.features[0].properties.fares)

		layerGroup.clearLayers();

		var markerLayer = L.geoJson(geojsonFeature, {
			onEachFeature: onEachFeature
		}).addTo(layerGroup)


		$("#map-container").show();
		mapLeaflet.invalidateSize();
	})	


}



function onEachFeature(feature, layer) {

	var popupContent = (
		'<div class="popup-content">' +
		'<p style="font-size: 20px"><font color="#3399ff"><b>' + feature.properties.city + '</b></p>' +
		'<p>(Airport: ' + feature.properties.id + ')</p></font>' +
		'<div id="curve_chart"></div>' +
		'</div>'
		);

	if (feature.properties) {
		layer.bindPopup(popupContent);
	}
}




function processFareResults(fareResults, mapLeaflet){
	// getting all the different destination objects from results
	$("#map-container").show();
	mapLeaflet.invalidateSize();

	for (var i=0; i < fareResults.length; i++) {

		var destination = fareResults[i];

		var fare = destination.fares;

		// some sections of the API response don't have any fare info
		// must hide this info
		if (fare[0].lowestFare === 0){

			console.log("No fare here.");

		// this else statement will only show results with fares	
		} else {

			// must convert lon & lat strings to float numbers!
			var lat = parseFloat(destination.coords.latitude);
			var lon = parseFloat(destination.coords.longitude);
			var marker = L.marker([lat,lon]).addTo(mapLeaflet);


			// getting destination info
			var airportcode = destination.id;
			var city = destination.city;
			console.log(city, fare);

			var lowestFare = destination.fares[0].lowestFare;
			var lowestFareDep = destination.fares[0].departureDateTime;
			var lowestFareRet = destination.fares[0].returnDateTime;

			var lowestNonStopFare = destination.fares[0].lowestNonStopFare;
			var lowestNonStopFareDep = destination.fares[0].departureDateTime;
			var lowestNonStopFareRet = destination.fares[0].returnDateTime;	

			var fareArray = [['Date', 'Fare', 'NonStop Fare'], ];			

			// must iterate through the different fare results for each destination
			for (var f=0; f < fare.length; f++ ) {
				
				var date = fare[f].departureDateTime.slice(0,10);
				var dateLowFare = parseInt(fare[f].lowestFare);
				var dateLowNonStopFare = fare[f].lowestNonStopFare;

				fareArray.push([date, dateLowFare, dateLowNonStopFare]);

				// find the lowest fare
				// see if there's more than one result
				// if so, go through each day and compare with the lowestfare
				// if lower than current lowestfare, update it
				if (fare[f].lowestFare < lowestFare) {
					lowestFare = fare[f].lowestFare;
					lowestFareDep = fare[f].departureDateTime;
					lowestFareRet = fare[f].returnDateTime;
				}
				if (fare[f].lowestNonStopFare < lowestNonStopFare) {
					lowestNonStopFare = fare[f].lowestNonStopFare;
					lowestNonStopFareDep = fare[f].departureDateTime;
					lowestNonStopFareRet = fare[f].returnDateTime;
				}
			}

			popupContent = (
				'<div class="popup-content">' +
				'<p style="font-size: 20px"><font color="#3399ff"><b>' + city + '</b></p>' +
				'<p>(Airport: ' + airportcode + ')</p></font>' +
				'<div class="lowestfarecontent"><p><b>Lowest Fare: </b>$' + parseInt(lowestFare) + '</p>' +
				'<p>Departure Date: ' + lowestFareDep.slice(0,10) + '</p>' +
				'<p>Return Date: ' + lowestFareRet.slice(0,10) + '</p><hr color="#3399ff">' +
				'<p><b>Lowest NonStop Fare: </b>$' + parseInt(lowestNonStopFare) + '</p>' +
				'<p>Departure Date: ' + lowestNonStopFareDep.slice(0,10) + '</p>' +
				'<p>Return Date: ' + lowestNonStopFareRet.slice(0,10) + '</p></div>' +
				'<div id="curve_chart"></div>' +
				'</div>'
				);

			}

			marker.bindPopup(popupContent);
			drawChart()
			
			// create a line chart here about the different dates of travel

			function drawChart() {
				var data = google.visualization.arrayToDataTable(fareArray);
				var options = {
					title: 'Fare Calendar',
					curveType: 'function',
					legend: {position: 'bottom'}
				};

				var chart = new google.visualization.LineChart($("#curve_chart"));

				google.setOnLoadCallback(drawChart);
				chart.draw(data, options);	
		}

	}
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




