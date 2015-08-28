from model import AirportCode, Campsite, connect_to_db, db
from flask import Flask, render_template, redirect, request, flash, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension

import requests
import json
import datetime
import pprint
import geojson

import os

instagram_client_id = os.environ["INSTAGRAM_CLIENT_ID"]
sabre_access_token = os.environ["SABRE_ACCESS_TOKEN"]

app = Flask(__name__)

app.secret_key = "CUPCAKES"


class FlightDestinMarker(object):
	"""	Make a class to convert flight results to geoJSON. """

	def __init__(self, lat, lon, airport_code, city, fares):
		self.id = airport_code
		self.lat = lat
		self.lon = lon
		self.city = city
		self.fares = fares

	@property 
	def __geo_interface__(self):
		return {'type': 'Feature', 
				'geometry': {
					'type': 'Point',
					'coordinates': [self.lat, self.lon]
				},
				'properties': {
					'marker-color': '#E94E77',
					'marker-size': 'medium',
					'marker-symbol': 'airport',
					'id': self.id,
					'city': self.city,
					'fares': self.fares
				} 
		}


class CampsiteMarker(object):
	""" Make a class to turn campsite results to geoJSON. """

	def __init__(self, name, lon, lat, phone, dates, comments, campsites):
		self.name = name
		self.lat = lat
		self.lon = lon
		self.phone = phone
		self.dates = dates
		self.comments = comments
		self.campsites = campsites


	@property 
	def __geo_interface__(self):
		return {'type': 'Feature', 
				'geometry': {
					'type': 'Point',
					'coordinates': [self.lat, self.lon]
				},
				'properties': {
					'marker-color': '#379F7A',
					'marker-size': 'medium',
					'marker-symbol': 'park',
					'name': self.name,
					'phone': self.phone,
					'comments': self.comments,
					'campsites': self.campsites
				} 
		}



@app.route("/")
def homepage():
	"""Displays webapp/homepage."""
	
	return render_template("webpage.html")



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



@app.route("/airfaresearch.json")
def airfare_search():
	"""Using Sabre API request with Bridge, returning fares info."""

	# getting the form values that the user has provided
	origin = request.args.get('origin')
	origin = origin[1:4]
	earliest_departure = request.args.get('earliest-departure-date')
	latest_departure = request.args.get('latest-departure-date')
	length_of_stay = request.args.get('length-of-stay')
	max_budget = request.args.get('max-budget')

	headers = {"Authorization": sabre_access_token}

	base_url = "http://bridge2.sabre.cometari.com/shop/flights/fares?"
	# param_url = "origin=SFO&earliestdeparturedate=2015-09-01&latestdeparturedate=2015-09-09&lengthofstay=3&maxfare=500&pointofsalecountry=US&ac2lonlat=1" 
	param_url = "origin=%s&earliestdeparturedate=%s&latestdeparturedate=%s&lengthofstay=%s&maxfare=%s&pointofsalecountry=US&ac2lonlat=1" % (
		origin, earliest_departure, latest_departure, length_of_stay, max_budget)
	
	# putting together the url to request to Sabre's API
	final_url = base_url + param_url

	# calling the API
	response = requests.get(final_url, headers=headers)


	# converting response to json
	response_text = response.json()

	pprint.pprint(response_text)

	fare_list = []

	for item in response_text:
		airport_code = item["id"]
		city = item["city"]
		check_type = type(item["coords"]["latitude"])
		if check_type == type(u'-85.736389000000003'):
			lat = float(item["coords"]["latitude"])
		else: 
			continue

		check_type = type(item["coords"]["longitude"])
		if check_type == type(u'-85.736389000000003'):
			lon = float(item["coords"]["longitude"])
		else:
			continue

		fares = item["fares"]
		# print airport_code, city, lat, lon, fares

		print "LOWEST FARE:", fares[0]["lowestFare"]

		if fares[0]["lowestFare"] == 0:
			continue
		else:
			one_result = FlightDestinMarker(lon, lat, airport_code, city, fares)

			fare_list.append(one_result)

	

	marker_collection = geojson.FeatureCollection(fare_list)
	print marker_collection
	

	# import pdb; pdb.set_trace()
	marker_geojson = geojson.dumps(marker_collection, sort_keys=True)

	return marker_geojson

	# # THIS WILL RETURN THE PLAIN JSON THAT WORKS
	# return jsonify(results=response_text) 


@app.route("/campsitesearch")
def campsite_search():
	"""Search for campsite if no flight results found."""

	origin = request.args.get('origin')
	origin = origin[1:4]
	print origin

	origin_object = AirportCode.query.filter(AirportCode.code==origin).first()

	print origin_object

	# 1.0 degrees is about 69 miles

	lat = origin_object.latitude
	lower_lat = lat - 1
	higher_lat = lat + 1

	print lat, lower_lat, higher_lat

	lon = origin_object.longitude
	lower_lon = lon - 1
	higher_lon = lon + 1

	print lon, lower_lon, higher_lon

	query_lat = Campsite.query.filter(Campsite.latitude < higher_lat,
											Campsite.longitude < higher_lon)

	length_first = len(query_lat.all())

	query_lat_lon = query_lat.filter(Campsite.latitude > lower_lat,
											Campsite.longitude > lower_lon).all()

	campsite_list = []

	# building my dictionary to pass as JSON
	for item in query_lat_lon:
		name = item.name
		lat = item.latitude
		lon = item.longitude
		phone = item.phone
		dates = item.dates
		comments = item.comments
		campsites = item.campsites

		campsite_info = CampsiteMarker(name, lat, lon, phone, dates, comments, campsites)

		campsite_list.append(campsite_info)


	marker_collection = geojson.FeatureCollection(campsite_list)
	print marker_collection
	

	# import pdb; pdb.set_trace()
	marker_geojson = geojson.dumps(marker_collection, sort_keys=True)

	return marker_geojson


@app.route("/instagram.json")
def get_instagram(): 
	""" Get instagram feed of tags with city name. """

	city = request.args.get('city')
	city = city.replace(" ", "")
	print "DID THE CITY STRIP %20?", city

	instagram_url = "https://api.instagram.com/v1/tags/%s/media/recent?client_id=%s" % (city, instagram_client_id)

	# calling the API
	insta_response = requests.get(instagram_url)

	# converting response to json
	insta_response_text = insta_response.json()

	pprint.pprint(insta_response_text)


	results = insta_response_text["data"]

	photo_list = []

	for item in results:
		print "I'M HERE"
		text = item["caption"]["text"]
		low_res_img = item["images"]["low_resolution"]["url"]
		link = item["link"]

		one_photo = {"img_url": low_res_img,
					"instagram_link": link,
					"caption": text}

		photo_list.append(one_photo)

	print "I'M INSTAGRAM API ENDPOINT URL: ", instagram_url

	return json.dumps(photo_list)





if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run()