from flask import request, jsonify
from app import app
from models import db, WeatherRequest
from utils import get_weather
import pandas as pd
from utils import get_youtube_links, get_google_maps_url

# CREATE
@app.route("/weather", methods=["POST"])
def create_weather():
    data = request.json
    location = data.get("location")
    date = data.get("date_requested")
    weather = get_weather(location)
    if weather:
        entry = WeatherRequest(location=location, date_requested=date, **weather)
        db.session.add(entry)
        db.session.commit()
        return jsonify({"message": "Weather entry created"}), 201
    return jsonify({"error": "Invalid location"}), 400

# READ
@app.route("/weather", methods=["GET"])
def read_weather():
    records = WeatherRequest.query.all()
    return jsonify([{
        "id": r.id,
        "location": r.location,
        "date_requested": r.date_requested,
        "temperature": r.temperature,
        "description": r.description
    } for r in records])

# UPDATE
@app.route("/weather/<int:id>", methods=["PUT"])
def update_weather(id):
    data = request.json
    entry = WeatherRequest.query.get(id)
    if not entry:
        return jsonify({"error": "Not found"}), 404
    if "location" in data:
        weather = get_weather(data["location"])
        if weather:
            entry.location = data["location"]
            entry.temperature = weather["temperature"]
            entry.description = weather["description"]
    if "date_requested" in data:
        entry.date_requested = data["date_requested"]
    db.session.commit()
    return jsonify({"message": "Updated successfully"})

# DELETE
@app.route("/weather/<int:id>", methods=["DELETE"])
def delete_weather(id):
    entry = WeatherRequest.query.get(id)
    if not entry:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": "Deleted"})
@app.route("/extras/<location>")
def extra_info(location):
    youtube = get_youtube_links(location)
    map_url = get_google_maps_url(location)
    return jsonify({"youtube": youtube, "map": map_url})
@app.route("/export", methods=["GET"])
def export_data():
    records = WeatherRequest.query.all()
    df = pd.DataFrame([{
        "location": r.location,
        "date": r.date_requested,
        "temp": r.temperature,
        "desc": r.description
    } for r in records])
    file_path = "export.csv"
    df.to_csv(file_path, index=False)
    return jsonify({"message": "Exported", "file": file_path})

