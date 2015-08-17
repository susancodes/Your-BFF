from model import AirportCode, Campsite, connect_to_db, db
from flask import Flask, render_template, redirect, request, flash, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension

import requests
import json
import datetime
import pprint

from xml.etree import ElementTree

app = Flask(__name__)

app.secret_key = "Susan Secret Key"

@app.route("/")
def homepage():
	"""Displays webapp/homepage."""
	
	return render_template("base.html")



@app.route("/autocomplete")
def autocomplete():
	"""Using AJAX, providing autocomplete in the form input from database info."""

	search_value = request.args.get('term')
	print search_value

	query = AirportCode.query.filter(db.or_(AirportCode.code.contains(search_value), 
											AirportCode.location.contains(search_value))).all()
	suggestion_list = []
	for item in query:
		code = item.code
		location = item.location
		suggestion_string = "(%s) %s" %(code, location)
		suggestion_list.append(suggestion_string)
	print suggestion_list
	return jsonify(data=suggestion_list)



@app.route("/airfaresearch")
def airfare_search():
	"""Using Sabre API request with Bridge, returning fares info."""

	# getting the form values that the user has provided
	origin = request.args.get('origin')
	origin = origin[1:4]
	earliest_departure = request.args.get('earliest-departure-date')
	latest_departure = request.args.get('latest-departure-date')
	length_of_stay = request.args.get('length-of-stay')
	max_budget = request.args.get('max-budget')

	headers = {"Authorization": "Bearer T1RLAQL/QfI2vTvwGfizaSk3pXYlMh5wFRA9+OLqQ/h/YpxelgqOaRpqAACgtWo5h/kal3de+BbK0myvIVkRW3Wrf4lMaGiqZUHe4EzdEMYR/sicpLqBE/bjRUcdTwm3RhBVTUdWPEmwboT+LgPLZlEqILTUTNV7TC4B8/IuUvh6Apgjf0UWZVrxJr/lvVA00gD/+Zu7AGt/NljQg+TdaXX3HxWFbO9MaxJG9+pxfaifdUEATwb+i2I5kRUmrlwgDUUnz8hkc1lIYtN+xg**",
	"X-Originating-Ip": "50.197.129.150"}

	base_url = "http://bridge2.sabre.cometari.com/shop/flights/fares?"
	# param_url = "origin=SFO&earliestdeparturedate=2015-09-01&latestdeparturedate=2015-09-03&lengthofstay=3&maxfare=200&pointofsalecountry=US&ac2lonlat=1" 
	param_url = "origin=%s&earliestdeparturedate=%s&latestdeparturedate=%s&lengthofstay=%s&maxfare=%s&pointofsalecountry=US&ac2lonlat=1" % (
		origin, earliest_departure, latest_departure, length_of_stay, max_budget)
	
	# putting together the url to request to Sabre's API
	final_url = base_url + param_url

	# calling the API
	response = requests.get(final_url, headers=headers)

	# checking the status code of API response
	status_code = response.status_code
	print "STATUS CODE HERE:", status_code


	response_text = response.json()

	pprint.pprint(response_text)

	return jsonify(results=response_text)
	

@app.route("/campsitesearch")
def campsite_search():
	"""Search for campsite if no flight results found."""

	origin = request.args.get('origin')
	origin = origin[1:4]
	print origin

	origin_object = AirportCode.query.filter(AirportCode.code==origin).first()

	print origin_object

	lat = origin_object.latitude
	lower_lat = lat - 0.8
	higher_lat = lat + 0.8

	print lat, lower_lat, higher_lat

	lon = origin_object.longitude
	lower_lon = lon - 0.8
	higher_lon = lon + 0.8

	print lon, lower_lon, higher_lon

	query_lat = Campsite.query.filter(Campsite.latitude < higher_lat,
											Campsite.longitude < higher_lon)

	length_first = len(query_lat.all())

	query_lat_lon = query_lat.filter(Campsite.latitude > lower_lat,
											Campsite.longitude > lower_lon).all()

	length = len(query_lat_lon)

	campsite_list = []

	for item in query_lat_lon:
		name = item.name
		latitude = item.latitude
		longitude = item.longitude
		phone = item.phone
		dates = item.dates
		comments = item.comments
		campsites = item.campsites
		campsite_info = {"name": name,
						"latitude": latitude, 
						"longitude": longitude, 
						"phone": phone, 
						"dates": dates, 
						"comments": comments, 
						"campsites": campsites}
		campsite_list.append(campsite_info)

	print "first: ", length_first
	print "second: ", length

	print campsite_list

	return jsonify(data=campsite_list)
	
	# fare_dictionary = {}
	# for item in response_json["FareInfo"]:
	# 	destination = item.get("DestinationLocation")
	# 	low_nonstop_fare = item.get("LowestNonStopFare").get("Fare")
	# 	depart_date = item.get("DepartureDateTime")
	# 	return_date = item.get("ReturnDateTime")
	# 	about_fare_dict = {"destination": destination, 
	# 						"low_nonstop_fare": low_nonstop_fare,
	# 						"depart_date": depart_date,
	# 						"return_date": return_date}
	# 	fare_dictionary[destination] = about_fare_dict
	# print fare_dictionary




if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    # app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    # DebugToolbarExtension(app)

    app.run()