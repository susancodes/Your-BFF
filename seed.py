from model import AirportCode, Campsite, connect_to_db, db
from server import app


def load_airportcodes():
    """Load airport codes into database."""

    the_file = open("./seed_data/airportcodes.txt")

    for line in the_file:
    	split_line = line.rstrip().split("|")
    	location = split_line[0]
    	code = split_line[1]

        # preparing to insert into database
        new_airportcode = AirportCode(code=code, location=location)
        print new_airportcode

        db.session.add(new_airportcode)
    	db.session.commit()


def load_coordinates():
    """Load coordinates of the airports."""

    the_file = open("./seed_data/airportcodescoordinates.txt")

    for line in the_file:

        line = line.decode(encoding="UTF-8")

        split_line = line.rstrip().split(",")
        longitude = split_line[7]
        latitude = split_line[6]
        airport_code = split_line[4]
        airport_code = airport_code[1:-1]

        # using the airport code data in existing database
        # go in and insert the lon and lat info to the right airport code row
        if airport_code:
            airport_code_in_db = AirportCode.query.filter(AirportCode.code==airport_code).first()
            if airport_code_in_db:
                airport_code_in_db.longitude = longitude
                airport_code_in_db.latitude = latitude
                print longitude, latitude
                db.session.commit()
            else:
                print "not in database"


def load_campsites(file_name):
    """Load campsites info into database."""

    the_file = open(file_name)

    for line in the_file:

        # before spliting up lines, we need to handle non-ascii characters
        # and decode it to avoid utf-8 errors
        line = _removeNonAscii(line)
        line = line.decode(encoding="UTF-8")

        split_line = line.rstrip().split(",")
        longitude = split_line[0]
        latitude = split_line[1]
        name = split_line[4]
        phone = split_line[6]
        dates = split_line[7]
        comments = split_line[8]
        campsites = split_line[9]

        # preparing to insert into database
        new_campsite = Campsite(name=name, longitude=longitude, latitude=latitude, phone=phone, dates=dates, comments=comments, campsites=campsites)
        print new_campsite
        
        db.session.add(new_campsite)
        db.session.commit()


# need to remove non-ascii characters to processes some camp csv files
# use function below
def _removeNonAscii(s): 
    return "".join(i for i in s if ord(i)<128)



if __name__ == "__main__":
    connect_to_db(app)

    load_airportcodes()
    load_coordinates()

    # loading multiple camp info files
    # files provided by http://www.uscampgrounds.info/takeit.html
    load_campsites("./seed_data/CanadaCamp.csv")
    load_campsites("./seed_data/MidwestCamp.csv")
    load_campsites("./seed_data/NortheastCamp.csv")
    load_campsites("./seed_data/SouthCamp.csv")
    load_campsites("./seed_data/SouthwestCamp.csv")
    load_campsites("./seed_data/WestCamp.csv")



