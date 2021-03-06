#Your BFF

Planning a trip is disheartening if you keep looking at your dream vacation and then at your economically disadvantaged bank account. Your BFF (Budget Flight Finder) takes away the frustrations of searching for travel destinations by showing you a list of roundtrip flights that fit your budget. If your budget can’t afford flights, your BFF will give you a list of nearby campsites for possible road trip plans. Knowing your options will help you explore the world!

Curently deployed [here](https://yourbff.herokuapp.com/)!

## Table of Contents

* [Required User Input](#required-input)
* [Round-trip Flights Output](#flights-output)
* [Campsites Output](#campsites-output)
* [Tech Stack](#tech-stack)
* [Credits](#credits)
* [About The Developer](#about-me)
* [About The WebApp](#about-app)


---------------------


### <a name="required-input"></a>Required User Input

- Origin Airport
> Enter a city and select from the airports from the autocomplete function

- Earliest Departure Date
> Select the earliest date you would like to start your trip

- Latest Departure Date
> Select the latest departure date 
> the larger the range between earliest and latest departure date, the more results will be returned

- Length of Stay
> Enter the number of days you would like your trip to be. 

- Max Budget
> Enter a dollar amount to search for roundtrip flights


![image](https://cloud.githubusercontent.com/assets/12265692/9803883/6663ac8c-57dc-11e5-80a0-f34c42bf8c6d.png)

-------------------


### <a name="flights-output"></a>Round-trip Flights Output

Here are all the destinations with its lowest roundtrip fares within your budget

![image](https://cloud.githubusercontent.com/assets/12265692/9593741/4f4a2594-5007-11e5-9bd7-4daf4c650d2a.png)



Yellow circular markers indicate a cluster of destinations. The number on the marker indicates the number of destinations in that cluster. The yellow markers have ten or more destinations in that cluster.

![image](https://cloud.githubusercontent.com/assets/12265692/9593678/721bd1cc-5006-11e5-8bea-d49c3f9cf895.png)



Green circular markers have less than ten destinations in that cluster

![image](https://cloud.githubusercontent.com/assets/12265692/9593693/a804438c-5006-11e5-999c-e57ce5701b10.png)



Pink markers with an airplane icon indicate ONE unique destination

![image](https://cloud.githubusercontent.com/assets/12265692/9593656/290866a8-5006-11e5-86a0-d343b483a43c.png)



##### Each destination has a pop-up with a summary
- Lowest Fare: absolute lowest roundtrip fare price within the specified dates and budget
- Depature & Return Dates correspond to the above said lowest flight

![image](https://cloud.githubusercontent.com/assets/12265692/9593130/985b781c-4fff-11e5-9ce3-2897f6ce2e21.png)



View Other Flight Options button returns a fare calendar of other possible flight options on other dates within the user specified earliest and latest depature date range.
![image](https://cloud.githubusercontent.com/assets/12265692/9614303/de660d30-50a5-11e5-98f5-ddb493e815f3.png)
![image](https://cloud.githubusercontent.com/assets/12265692/9593131/9d399ca6-4fff-11e5-8a0e-4262ebdf28e8.png)


-------------------


### <a name="campsites-output"></a>Campsites Output

When a user's budget does not return any flight options, it will output campsite locations within a 100-mile-radius. 

![image](https://cloud.githubusercontent.com/assets/12265692/9593253/16ad7d72-5001-11e5-9609-54f59690fa0c.png)



Marker attributes are the same as above for clusters.

Green markers with a tree icon indicate ONE unique campsite information.

![image](https://cloud.githubusercontent.com/assets/12265692/9593270/35f549b2-5001-11e5-8eda-65fc05024597.png)

##### Each campsite has a pop-up with the following information:
- Campsite Name
- Campsite Phone Number
- Dates Open (if available)
- Notes/Comments About Campsite
- Number of Campsites


---------------------

### <a name="tech-stack"></a>Tech Stack & APIs

Python, SQLite (migrated later to PostgreSQL to deploy on Heroku) database of airport codes and cities for autocomplete feature and database of campsites, geoJSON to format data to be used with Mapbox API, Google Charts API for the Fare Calendar, and Instagram API.

I chose to make a single-page webapp because I wanted to be more fluent in Javascript and AJAX. I also wanted the user to be able to modify their budget on the spot and not have to navigate to another page. Once the user modifies their budget, I wanted the results to be shown dynamically on the same page which required clearing the current data markers on the map and repopulating a different set of markers under the new criteria that the user specified.


----------------------


### <a name="credits"></a>Credits

Credits to [Sabre](https://developer.sabre.com/) & [Cometari](http://www.cometari.com/) for providing flight information, [USCampgrounds](http://www.uscampgrounds.info/) for the campsite data, [Mapbox](https://www.mapbox.com/) for the beautiful map UI, Instagram for the photo feed, and Google Charts API.


### <a name="about-me"></a>About the Developer

[Susan Chin](https://www.linkedin.com/in/susanschin) is part of the Summer 2015 Hackbright Academy Full-Time Software Engineering Immersive Fellowship for women. The fellowship is a total of 10-weeks long with the first half focused on structured lectures and lab time and the second half focused on a personal project. This is Susan's project to showcase what she's learned from the accelerated program.

Susan loves to debug so if you find any bugs in this project, please let her know!


### <a name="about-app"></a>About This WebApp

Travel is a lot more than visiting a place that is not your home. It opens up a new world of culture, perspective, and opportunities to try new things. The developer of this webapp hopes to encourage people to travel regardless of monetary limits. This webapp provides the options so the user can make better and smarter decisions to stretch his/her dollar while getting to see the world. It uses live flight data from Sabre so anyone can make a search to go anywhere around the world. The sky is the limit. 




