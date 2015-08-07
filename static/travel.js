function getFareResults(evt){
	debugger;
	evt.preventDefault();
	$.get('/airfaresearch'), function(data){
		var fare_results = data;
		$('#faredetails').html(fare_results);
	}
}


$('#faresearchform').on('submit', getFareResults);