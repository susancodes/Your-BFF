
// Initialize Map but hidden until user submits form
$("#map-container").hide();

google.load('visualization', '1', {packages: ['corechart']});
google.setOnLoadCallback(initialize);

L.mapbox.accessToken = 'pk.eyJ1Ijoic3VzYW5jb2RlcyIsImEiOiJhMmIyNGY3ODljOWE5ODhmYzFhYWE4YzM3YzAwZjg5ZiJ9.fyRv1wgTMRJuH-v-orHx6w';
var mapLeaflet = L.mapbox.map('map-leaflet', 'susancodes.1e9ac8a5')
  .setView([37.8, -96], 4)

// must create a layer group so that I can wipe out the markers when user changes budget
var layerGroup = L.layerGroup().addTo(mapLeaflet);

var featureGroup = L.featureGroup(layerGroup);



// Style the marker icon
var myIcon = L.icon({
	iconUrl: '/static/img/airplane-icon.png',
	iconSize: [38, 95],
	iconAnchor: [22, 94],
	popupAnchor: [-3, -76],
});

mapLeaflet.scrollWheelZoom.disable();


$('#faresearchform').on('submit', getFareResults);



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
		console.log(geojsonFeature);

		if (geojsonFeature.features.length === 0) {
			searchCampsites();
		} else {
			processFareResults(geojsonFeature);
		}

	})
}


function processFareResults(geojsonFeature) {
	layerGroup.clearLayers();

	var markers = new L.markerClusterGroup().addTo(layerGroup);

	var markerLayer = L.geoJson(geojsonFeature, {
		onEachFeature: 
		function onEachFeature(feature, layer) {
			
			var fare = feature.properties.fares;
			console.log("fare: " + fare);

			var lowestFare = fare[0].lowestFare;
			var lowestFareDep = fare[0].departureDateTime;
			var lowestFareRet = fare[0].returnDateTime;
			 

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

			var fareArray = [];

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
				'<p id="city-name" style="font-size: 20px"><font color="#3399ff"><b>' + feature.properties.city + '</b></p>' +
				'<p>(Airport: ' + feature.properties.id + ')</p></font>' +
				'<div class="lowestfarecontent"><p><b>Lowest Fare: </b>$' + parseInt(lowestFare) + '</p>' +
				'<p>Departure Date: ' + lowestFareDep.slice(0,10) + '</p>' +
				'<p>Return Date: ' + lowestFareRet.slice(0,10) + '</p><hr color="#3399ff">' +
				// '<p><b>Lowest NonStop Fare: </b>$' + parseInt(lowestNonStopFare) + '</p>' +
				// '<p>Departure Date: ' + lowestNonStopFareDep.slice(0,10) + '</p>' +
				// '<p>Return Date: ' + lowestNonStopFareRet.slice(0,10) + '</p></div>' +
				'<div id="fare-array">' + fareArray + '</div>' +
				// '<div id="curve-chart"></div>' +
				'<div id="instagram-box"><button class="instagram-btn">Instagram</button></div>' + 
				'<button class="chart-btn">Chart</button>' + 
				'</div>'
				);

			if (feature.properties) {
				layer.bindPopup(popupContent);
				// getInstagramPics();
			}

		}
	})
	// adding the marker layer to the cluster group, which is in a group layer on our map
	markers.addLayer(markerLayer);

	// When the map shows itself, it must readjust its size
	$("#map-container").show();
	mapLeaflet.invalidateSize();
	mapLeaflet.fitBounds(markers.getBounds());

	flightsMapMessage();
	setTimeout(emptyMapMessage, 7000);

}

$('.map').on('click', '.instagram-btn', function() {
    alert("I'm doing instagram things!");
    var city = $("#city-name").text();
    console.log(city);
    // getInstagramPics(city);

});


function initialize() {
	$(".map").on('click', '.chart-btn', function () {
	    var fareList = $("#fare-array").html();
	    console.log(fareList);
		drawChart(fareList);
	})
}

function drawChart(fareList) {
	var fareList = fareList;
    fareList = fareList.split(",");
    fareArray = [];
    fareArrayCounter = 0;

	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Date');
	data.addColumn('number', 'Lowest Fare');
	data.addColumn('number', 'Lowest NonStop Fare');
    for (var c=0; c < fareList.length; c++) {
	    console.log(fareList);
	    console.log(fareList[0]);
	    console.log(fareList[1]);
	    console.log(fareList[2]);
	    var date1 = fareList.shift();
	    var fare1 = parseInt(fareList.shift());
	    var nonstopfare1 = parseInt(fareList.shift());

	    data.addRow([date1, fare1, nonstopfare1]);
	}

	var options = {
		title: 'Fare Calendar for ' + $("#city-name").text(),
		titleTextStyles: {size: 16, color: '#3399ff'},
		curveType: 'function',
		height: 500,
		width: 500,
		legend: {position: 'bottom'},
		vAxis: {format: 'currency', title: 'Price', fontSize: 16},
		hAxis: {title: 'Available Flight Dates', titleTextStyles}
	};	

	var formatter = new google.visualization.NumberFormat({
		prefix: '$',
	});

	formatter.format(data, 1);
	formatter.format(data, 2);

	console.log(data);
	console.log(options);

	var chart = new google.visualization.LineChart(document.getElementById('curve-chart'));
	chart.draw(data, options);	
	console.log(chart);

}



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


if any ajax is broken, this message will display
$(document).ajaxError(function(){
	showErrorMessage();
})


function searchCampsites() {

	// evt.preventDefault();
	// console.log("prevented default");

	var url = "/campsitesearch?origin=" + $("#airportcodes").val()

	$.get(url, function (data){
	
		var campsiteResults = JSON.parse(data);
		console.log(campsiteResults);

		layerGroup.clearLayers();

		var markers = new L.markerClusterGroup().addTo(layerGroup);

		var markerLayer = L.geoJson(campsiteResults, {
			onEachFeature:
			function onEachFeature(feature, layer) {
				console.log(feature);

				var popupContent = (
					'<div class="popup-content">' +
					'<p id="city-name" style="font-size: 20px"><font color="#3399ff"><b>' + feature.properties.name + '</b></p>' +
					'<p>(Phone: ' + feature.properties.phone + ')</p></font>' +
					'<div><p>Dates Open: ' + feature.properties.dates + '</p>' +
					'<p>Notes: ' + feature.properties.comments + '</p>' +
					'<p>Number of Campsites: ' + feature.properties.campsites + '</p></div>' +
					'</div>'
					);

				if (feature.properties) {
					layer.bindPopup(popupContent);
				
				}

			}

		})

		markers.addLayer(markerLayer);
		mapLeaflet.fitBounds(markers.getBounds());
	})

	$("#map-container").show();
	mapLeaflet.invalidateSize();
	campsiteMapMessage();
	setTimeout(emptyMapMessage, 7000);
}


// INSTAGRAM AJAX
function getInstagramPics(markerCity) {
	// debugger;
	console.log("getting instagram stuff")
	var city = markerCity
	console.log("city: " + city);
	var url = "/instagram.json?city=" + city
	$.get(url, function(data) {
		var photos = JSON.parse(data)
		console.log(photos);
	})
}


// marker.on("click", getInstagramPics())


// SHOW DIFFERENT MESSAGES BASED ON RESULTS

function showErrorMessage() {
	$("#flash-message").html("<br>Something went wrong. Please refresh the page and try again.<br>");
	$("#flash-message").show();
}

function showLoadingMessage() {
	$("#flash-message").html("<br>Your BFF (budget flight finder) is hard at work. One moment please...</br>");
	$("#flash-message").show();

}

function emptyFlashMessage() {
	$("#flash-message").html("");
	$("#flash-message").hide();
}

function flightsMapMessage() {
	$("#over-map-box").html("Have a safe flight!");
	$("#over-map-box").show();

}

function campsiteMapMessage() {
	$("#over-map-box").html("Consider taking a road trip and camping!");
	$("#over-map-box").show();

}

function emptyMapMessage() {
	$("#over-map-box").html("");
	$("#over-map-box").hide();
}






