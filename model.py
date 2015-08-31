
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


# this is for airport codes database
class AirportCode(db.Model):
    """Airport code for departure and arrival destinations."""

    __tablename__ = "airportcodes"

    code = db.Column(db.String(3), primary_key=True)
    location = db.Column(db.String(50), nullable=False)
    longitude = db.Column(db.Float)
    latitude = db.Column(db.Float)


    def __repr__ (self):
        """Statement when printed."""

        return "<Object Airport Code:%s for %s>" % (self.code, self.location)



# this is for the campsites database
class Campsite(db.Model):
    """

    Campsite information in database.

    Includes coordinates (lon & lat), campsite name, phone #, dates open, comments, and # of campsites.

    """

    __tablename__ = "campsites"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    phone = db.Column(db.String(50))
    dates = db.Column(db.String(50))
    comments = db.Column(db.String(50))
    campsites = db.Column(db.Integer)

    def __repr__(self):
        """Statement to ID this campsite object when printed."""

        return "<Object Campsite Name: %s>" % (self.name)




#########THIS CONNECTS TO DATABASE SO WE CAN WORK INTERACTIVELY IN CONSOLE

def connect_to_db(app):
    """Connect the database to our Flask app."""

    # Configure to use SQLite database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobtitle.db'
    db.app = app
    db.init_app(app)




if __name__ == "__main__":
# allows working with the database directly

    from server import app
    connect_to_db(app)
    print "Connected to DB."

