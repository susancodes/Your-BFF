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



if __name__ == "__main__":
    connect_to_db(app)

    load_airportcodes()