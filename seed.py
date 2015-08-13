from model import AirportCode, connect_to_db, db
from server import app


def load_airportcodes():
    """Load airport codes into database."""
    the_file = open("./seed_data/airportcodes.txt")
    for line in the_file:
    	split_line = line.rstrip().split("|")
    	# print split_line
    	location = split_line[0]
    	code = split_line[1]
    	# print code, location
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
        if airport_code:
            airport_code_in_db = AirportCode.query.filter(AirportCode.code==airport_code).first()
            if airport_code_in_db:
                airport_code_in_db.longitude = longitude
                airport_code_in_db.latitude = latitude
                print longitude, latitude
                db.session.commit()
            else:
                print "not in database"


if __name__ == "__main__":
    connect_to_db(app)

    load_airportcodes()
    load_coordinates()