// GETTING FARE RESULTS AJAX

function initializeMap(evt){
	
}

function getFareResults(evt){
	// preventing form submission
	evt.preventDefault();
	console.log("prevented default");

	// sending GET request to get form values
	var url = "/airfaresearch?origin=" + $("#airportcodes").val() + 
				"&earliest-departure-date=" + $("#early-depart-field").val() +
				"&latest-departure-date=" + $("#late-depart-field").val() +
				"&length-of-stay=" + $("#length-of-stay-field").val() +
				"&max-budget=" + $("#max-budget-field").val();
	// console.log(url)


	// Mapbox stuff
	$("#map-leaflet").empty()

	L.mapbox.accessToken = 'pk.eyJ1Ijoic3VzYW5jb2RlcyIsImEiOiJhMmIyNGY3ODljOWE5ODhmYzFhYWE4YzM3YzAwZjg5ZiJ9.fyRv1wgTMRJuH-v-orHx6w';
	var mapLeaflet = L.mapbox.map('map-leaflet', 'susancodes.1e9ac8a5')
	  .setView([37.8, -96], 4)



	// Style the marker icon
	var myIcon = L.icon({
		iconUrl: '/static/img/airplane-icon.png',
		iconSize: [38, 95],
		iconAnchor: [22, 94],
		popupAnchor: [-3, -76],
	});


	mapLeaflet.scrollWheelZoom.disable();

	// Making an ajax call to get the API response
	
	$.get(url, function(data){
		var fare_results = data.results;
		// TESTING MARKERS
		// var coordList = [
		// 	{"lon": 33.675556, "lat": -117.867222},
		// 	{"lon": 47.449167000000003, "lat": -122.30805599999999},
		// 	{"lon": 32.733333000000002, "lat": -117.186667},
		// ]

		// for (i=0; i<coordList.length; i++) {
		// 	var lon = coordList[i].lon;
		// 	var lat = coordList[i].lat;
		// 	console.log("lon: " + lon + " lat: " + lat);
		// 	L.marker([lon,lat]).addTo(mapLeaflet);
		// }

		// getting all the different destination objects from results
		for (var i=0; i < fare_results.length; i++) {

			var destination = fare_results[i];

			var fare = destination.fares;

			// some API response doesn't have any fare info
			// must hide this info
			if (fare[0].lowestFare === 0){

				console.log("No fare here.")

			// this else statement will only show results with fares	
			} else {

				// must convert lon & lat strings to float numbers!
				var lat = parseFloat(destination.coords.latitude);
				var lon = parseFloat(destination.coords.longitude);
				marker = L.marker([lat,lon]).addTo(mapLeaflet);

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
					// '<div id="curve_chart"></div>' +
					'</div>'
					);

				}

				marker.bindPopup(popupContent);
				
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
	});
}


$('#faresearchform').on('submit', getFareResults);





// AUTOCOMPLETE - HAVING SELECTION PROBLEMS. FIXME LATERRRRRR

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



