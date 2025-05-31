from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class WeatherRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(100), nullable=False)
    date_requested = db.Column(db.String(10), nullable=False)
    temperature = db.Column(db.Float)
    description = db.Column(db.String(100))
