#Your BFF

Planning a trip is disheartening if you keep looking at your dream vacation and then at your economically disadvantaged bank account. Your BFF (Budget Flight Finder) takes away the frustrations of searching for travel destinations by showing you a list of roundtrip flights that fit your budget. If your budget can’t afford flights, your BFF will give you a list of nearby campsites for possible road trip plans. Knowing your options will help you explore the world!

### Required User Input

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


### Round Trip Flights Output

Here are all the destinations with its lowest roundtrip fares within your budget
![image] https://cloud.githubusercontent.com/assets/12265692/9592924/594f05a0-4ffd-11e5-966d-ccac3aa475ce.png

Yellow circular markers indicate a cluster of destinations. The number within the yellow circle indicates the number of destinations in that cluster.
The yellow clusters have ten or more destinations in that cluster.
![image] https://cloud.githubusercontent.com/assets/12265692/9593001/556db1ec-4ffe-11e5-8ac8-7142b3909b7e.png

Green circular markers have less than ten destinations in that cluster
![image] https://cloud.githubusercontent.com/assets/12265692/9593004/609980f0-4ffe-11e5-97c9-90c3d79506d0.png

Pink markers with an airplane icon indicate ONE unique destination
![image] https://cloud.githubusercontent.com/assets/12265692/9593005/6502716a-4ffe-11e5-9558-e1dd6331885a.png

Each destination has a pop-up with a summary
- Lowest Fare: absolute lowest roundtrip fare price within the specified dates and budget
- Depature & Return Dates correspond to the above said lowest flight
![image] https://cloud.githubusercontent.com/assets/12265692/9593130/985b781c-4fff-11e5-9ce3-2897f6ce2e21.png


![image] https://cloud.githubusercontent.com/assets/12265692/9593130/985b781c-4fff-11e5-9ce3-2897f6ce2e21.png More flight options button returns a fare calendar of other possible flight options on other dates within the user specified earliest and latest depature date range.
![image] https://cloud.githubusercontent.com/assets/12265692/9593131/9d399ca6-4fff-11e5-8a0e-4262ebdf28e8.png



### Credits

Credits to Sabre & Cometari for providing flight information, USCampgrounds for the campsite data, Mapbox for the beautiful map UI, Instagram for the photo feed, and Google Charts API.


### About the Developer

[Susan Chin](https://www.linkedin.com/in/susanschin) is part of the Summer 2015 Hackbright Academy Full-Time Software Engineering Immersive Fellowship for women. The fellowship is a total of 10-weeks long with the first half focused on structured lectures and lab time and the second half focused on a personal project. This is Susan's project to showcase what she's learned from the accelerated program.

