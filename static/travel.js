
// Initialize Map but hidden until user submits form
$("#map-container").hide();

L.mapbox.accessToken = 'pk.eyJ1Ijoic3VzYW5jb2RlcyIsImEiOiJhMmIyNGY3ODljOWE5ODhmYzFhYWE4YzM3YzAwZjg5ZiJ9.fyRv1wgTMRJuH-v-orHx6w';
var mapLeaflet = L.mapbox.map('map-leaflet', 'susancodes.1c1d3854')
  .setView([37.8, -96], 4)

// must create a layer group so that I can wipe out the markers when user changes budget
var layerGroup = L.layerGroup().addTo(mapLeaflet);

// must declare feature group to set bounds
var featureGroup = L.featureGroup(layerGroup);


// Style the marker icon
var myIcon = L.icon({
	iconUrl: '/static/img/airplane-icon.png',
	iconSize: [38, 95],
	iconAnchor: [22, 94],
	popupAnchor: [-3, -76],
});

mapLeaflet.scrollWheelZoom.disable();


// must load google charts API package, but it will wait for event listener to draw chart
google.load('visualization', '1', {packages: ['corechart']});
google.setOnLoadCallback(initialize);


// on document ready, must check for placeholder
$(document).ready(function(){

	// Test for placeholder support
	$.support.placeholder = (function(){
	    var i = document.createElement('input');
	    return 'placeholder' in i;
	})();

	// Hide labels by default if placeholders are supported
	if($.support.placeholder) {
	    $('.row .form-group label').each(function(){
	        $(this).addClass('js-hide-label');
	    });  
	 
		$('.row .form-group').find('input').on('keyup blur focus', function(e){
		     
		    // Cache our selectors
		    var $this = $(this),
		        $parent = $this.parent();
		 	// console.log("this " + $this.html());
		 	console.log("parent" + $parent.html());
		    // Add or remove classes
		    if (e.type == 'keyup') {                   
				if( $this.val() == '' ) {
				    $parent.addClass('js-hide-label'); 
				    console.log("parent" + $parent.html());
				} else {
				    $parent.removeClass('js-hide-label');   
				}
		    } 
		    else if (e.type == 'blur') {
				if( $this.val() == '' ) {
				    $parent.addClass('js-hide-label');
				} 
				else {
				    $parent.removeClass('js-hide-label').addClass('js-unhighlight-label');
				}
		        
		    } 
		    else if (e.type == 'focus') {
				if( $this.val() !== '' ) {
				    $parent.removeClass('js-unhighlight-label');
				    console.log("parent " + $parent.html());
				}
		    }
		});
	} 
});




// ALL WEBAPP FUNCTIONS START HERE

function getFareResults(evt){
// get flight results

	showLoadingMessage();
	setTimeout(emptyFlashMessage, 3000);

	// preventing form submission
	evt.preventDefault();
	console.log("prevented default");


	// sending GET request to get form values
	var url = "/airfaresearch.json?origin=" + $("#airportcodes").val() + 
				"&earliest-departure-date=" + $("#early-depart").val() +
				"&latest-departure-date=" + $("#late-depart").val() +
				"&length-of-stay=" + $("#length-of-stay").val() +
				"&max-budget=" + $("#max-budget").val();
	console.log(url)


	// // Making an ajax call to get the API response in PLAIN JSON
	// // THIS IS WORKING. DO NOT ERASE *****************************
	// $.get(url, function (data) {
	// 	var fareResults = data.results;
	// 	console.log(fareResults);
	// 	processFareResults(fareResults, mapLeaflet);
	// })


	// calling for geoJSON
	$.get(url, function (data) {
		var geojsonFeature = JSON.parse(data);
		console.log(geojsonFeature);

		if (geojsonFeature.features.length === 0) {
			searchCampsites();
		} else {
			processFareResults(geojsonFeature);
		}
		window.location = "#linktomap";

	})
}


function processFareResults(geojsonFeature) {
// display flight results on map

	// clears previous data markers, if any
	layerGroup.clearLayers();


	// this makes markers cluster
	var markers = new L.markerClusterGroup().addTo(layerGroup);

	var markerLayer = L.geoJson(geojsonFeature, {

		pointToLayer: L.mapbox.marker.style,
    	style: function(feature) { return feature.properties; },

		onEachFeature: 
		function onEachFeature(feature, layer) {
			
			var fare = feature.properties.fares;
			console.log("fare: " + fare);

			var lowestFare = fare[0].lowestFare;
			var lowestFareDep = fare[0].departureDateTime;
			var lowestFareRet = fare[0].returnDateTime;
			 
			var fareArray = [];
			
			for (var f=0; f < fare.length; f++) {
			
				var date = fare[f].departureDateTime.slice(5,10);
				console.log(date);
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

			}

			var popupContent = (
				'<div class="popup-content">' +
				'<p id="city-name" style="font-size: 20px"><font color="#E94E77"><b>' + feature.properties.city + '</b></p>' +
				'<p>(Airport: ' + feature.properties.id + ')</p></font>' +
				'<div class="lowestfarecontent"><p><b>Lowest Fare: </b>$' + parseInt(lowestFare) + '</p>' +
				'<p>Departure Date: ' + lowestFareDep.slice(0,10) + '</p>' +
				'<p>Return Date: ' + lowestFareRet.slice(0,10) + '</p><hr color="#E94E77">' +
				'<div id="fare-array" style="display: none" hidden>' + fareArray + '</div>' +
				'<p><button class="chart-btn" data-toggle="modal" data-target="#curve-chart">View Other Flight Options</button></p>' + 
				'<p id="instagram-box"><button class="instagram-btn" data-toggle="modal" data-target="#instagram-feed">Instagram Feed</button></p>' + 
				'</div>'
				);

			if (feature.properties) {
				layer.bindPopup(popupContent);
			}

		}
	})

	// adding the marker layer to the cluster group, which is in a group layer on our map
	markers.addLayer(markerLayer);

	// When the map shows itself, it must readjust its size
	$("#map-container").show();
	mapLeaflet.invalidateSize();
	mapLeaflet.fitBounds(markers.getBounds());

	// tells user that they're seeing flight results
	flightsMapMessage();
	setTimeout(emptyMapMessage, 7000);

}



function searchCampsites() {
// search for campsites when flight results is an empty array

	var url = "/campsitesearch?origin=" + $("#airportcodes").val()

	$.get(url, function (data){
	
		var campsiteResults = JSON.parse(data);
		console.log(campsiteResults);

		layerGroup.clearLayers();

		var markers = new L.markerClusterGroup().addTo(layerGroup);

		var markerLayer = L.geoJson(campsiteResults, {

			pointToLayer: L.mapbox.marker.style,
    		style: function(feature) { return feature.properties; },

			onEachFeature:
			function onEachFeature(feature, layer) {
				console.log(feature);

				var popupContent = (
					'<div class="popup-content">' +
					'<p id="city-name" style="font-size: 20px"><font color="#379F7A"><b>' + feature.properties.name + '</b></p>' +
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

	// switch map from hidden to show
	// must invalidate size for map to show up
	$("#map-container").show();
	mapLeaflet.invalidateSize();

	// let the user know they're getting campsite results
	campsiteMapMessage();
	setTimeout(emptyMapMessage, 7000);
}




// GOOGLE CHART FUNCTIONS

function initialize() {
// google charts must load its API when page loads but it will wait for an event handler to draw chart

	$(".map").on('click', '.chart-btn', function () {
	    var fareList = $("#fare-array").html();
	    console.log(fareList);
		setTimeout(function () {drawChart(fareList)}, 1000);
	})
}


function drawChart(fareList) {
// drawing chart from marker popup info

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
		title: $("#city-name").text(),
		titleTextStyles: {size: 16, color: '#3399ff'},
		curveType: 'function',
		height: 600,
		width: 550,
		legend: {position: 'bottom'},
		series: {0: {color: 'C6E5D9'}, 1: {color: 'D68189'}},
		lineWidth: 4, 
		vAxis: {format: 'currency', title: 'Price', titleTextStyles: {fontSize: '16', fontName: 'Arial', fontStyle: 'normal'}},
		hAxis: {title: 'Available Flight Dates', 
				direction: -1,
		        slantedText: true,
		        slantedTextAngle: 45},
		titleTextStyles: {fontSize: 16, fontName: 'Arial', fontStyle: 'normal'}
	};	

	var formatter = new google.visualization.NumberFormat({
		prefix: '$',
	});

	formatter.format(data, 1);
	formatter.format(data, 2);

	console.log(data);
	console.log(options);

	var chart = new google.visualization.LineChart(document.getElementById('modal-chart'));


	chart.draw(data, options);	
	console.log(chart);

}



// INSTAGRAM AJAX
function getInstagramPics(markerCity) {
	// debugger;
	console.log("getting instagram stuff")
	var city = markerCity
	console.log("city: " + city);
	var url = "/instagram.json?city=" + city
	$('ul#instagram-photos').html('');

	$.get(url, function(data) {
		var photos = JSON.parse(data)
		console.log(photos);
		for (i=0; i < photos.length; i++) {
			var img_caption = photos[i].caption;
			var img_url = photos[i].img_url;
			$('ul#instagram-photos').append('<li><img src="' + img_url + '" title="'+ img_caption + '"></li>');
		}
	})
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


// EVENT LISTENERS

// when user clicks instagram button
$('.map').on('click', '.instagram-btn', function() {
    // alert("I'm doing instagram things!");
    var city = $("#city-name").text();
    console.log(city);
    getInstagramPics(city);

});



// when user submits form
$('#faresearchform').on('submit', getFareResults);



// if any ajax is broken, this message will display
$(document).ajaxError(function(){
	showErrorMessage;
})




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
	$("#over-map-box").html("Consider taking a road trip to one of these campsites!");
	$("#over-map-box").show();

}

function emptyMapMessage() {
	$("#over-map-box").html("");
	$("#over-map-box").hide();
}






