import os
from datetime import datetime, timezone
from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import requests # For making HTTP requests to external APIs
from dotenv import load_dotenv
import csv
import io # For CSV in-memory file

load_dotenv()

app = Flask(__name__)

# --- Configuration ---
MONGO_URI = os.getenv("MONGO_URI")
OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
Maps_API_KEY = os.getenv("Maps_API_KEY") # Used for more robust geocoding or map embeds

if not MONGO_URI:
    raise EnvironmentError("MONGO_URI not found in environment variables.")
if not OPENWEATHERMAP_API_KEY:
    raise EnvironmentError("OPENWEATHERMAP_API_KEY not found in environment variables.")

client = MongoClient(MONGO_URI)
db = client.weather_app_db # Or your preferred database name
history_collection = db.weather_history

# --- Helper Functions ---

def geocode_location_owm(location_string):
    """Geocodes location using OpenWeatherMap Geocoding API."""
    if not location_string:
        return None
    params = {
        'q': location_string,
        'limit': 1,
        'appid': OPENWEATHERMAP_API_KEY
    }
    try:
        response = requests.get("http://api.openweathermap.org/geo/1.0/direct", params=params)
        response.raise_for_status() # Raise an exception for HTTP errors
        data = response.json()
        if data:
            return {
                "name": data[0].get("name", location_string),
                "lat": data[0]["lat"],
                "lon": data[0]["lon"],
                "country": data[0].get("country", ""),
                "state": data[0].get("state", "")
            }
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Geocoding error for {location_string}: {e}")
    except (IndexError, KeyError) as e:
        app.logger.error(f"Geocoding parsing error for {location_string}: {e}")
    return None

def fetch_current_weather_data(lat, lon):
    """Fetches current weather from OpenWeatherMap."""
    params = {
        'lat': lat,
        'lon': lon,
        'appid': OPENWEATHERMAP_API_KEY,
        'units': 'metric'  # Or 'imperial' for Fahrenheit
    }
    try:
        response = requests.get("https://api.openweathermap.org/data/2.5/weather", params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Current weather fetch error for {lat},{lon}: {e}")
    return None

def fetch_mock_historical_weather_data(lat, lon, start_date_str, end_date_str):
    """
    MOCK function for historical weather.
    A real implementation would call a historical weather API (often paid).
    This returns dummy data for the date range.
    """
    app.logger.info(f"Fetching MOCK historical data for {lat},{lon} from {start_date_str} to {end_date_str}")
    # For demonstration, we'll just create some dummy entries.
    # In a real scenario, you'd parse start_date_str and end_date_str
    # and query an actual historical weather API.
    return [
        {"date": start_date_str, "avg_temp": 10, "min_temp": 5, "max_temp": 15, "condition": "Cloudy", "precipitation": 2},
        {"date": end_date_str, "avg_temp": 12, "min_temp": 7, "max_temp": 17, "condition": "Sunny", "precipitation": 0}
    ]

# --- Custom Error Handler ---
@app.errorhandler(400)
def bad_request(error):
    return jsonify(error=str(error.description)), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify(error=str(error.description if error.description else "Resource not found")), 404

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify(error="An internal server error occurred."), 500

# --- Routes ---

@app.route("/")
def home():
    return "Welcome to the Weather App Backend!"

# == Current Weather ==
@app.route('/api/weather/current', methods=['GET'])
def get_current_weather():
    location_query = request.args.get('location')
    if not location_query:
        return jsonify({"error": "Location parameter is required"}), 400

    geocoded_data = geocode_location_owm(location_query)
    if not geocoded_data:
        return jsonify({"error": f"Location '{location_query}' not found or geocoding failed."}), 404

    current_weather = fetch_current_weather_data(geocoded_data['lat'], geocoded_data['lon'])
    if not current_weather:
        return jsonify({"error": "Failed to fetch current weather data."}), 500

    return jsonify({
        "requested_location": location_query,
        "location_details": geocoded_data,
        "current_weather": current_weather
    })

# == CRUD for Saved Weather History ==

# CREATE
@app.route('/api/weather-history', methods=['POST'])
def create_weather_history():
    data = request.get_json()
    if not data or not data.get('location') or not data.get('startDate') or not data.get('endDate'):
        return jsonify({"error": "Missing required fields: location, startDate, endDate"}), 400

    location_str = data['location']
    start_date_str = data['startDate']
    end_date_str = data['endDate']
    user_notes = data.get('userNotes', "")

    # Validate date ranges (basic)
    try:
        start_dt = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
        if start_dt > end_dt:
            return jsonify({"error": "Start date cannot be after end date."}), 400
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use ISO format (YYYY-MM-DDTHH:MM:SSZ)."}), 400

    # Validate location
    geocoded_location = geocode_location_owm(location_str)
    if not geocoded_location:
        return jsonify({"error": f"Location '{location_str}' could not be validated or found."}), 404

    # Fetch historical weather (using MOCK for this example)
    # In a real app, call your chosen historical weather API here.
    # Ensure the API can handle the date range.
    historical_data = fetch_mock_historical_weather_data(
        geocoded_location['lat'], geocoded_location['lon'], start_date_str, end_date_str
    )
    if not historical_data: # Or if the API returned an error/empty
         app.logger.warning(f"No historical data found/mocked for {location_str} from {start_date_str} to {end_date_str}")
        # Decide if this is an error or just an empty result to store
        # return jsonify({"error": "Failed to fetch historical weather data for the given range."}), 502 # Bad Gateway if API failed


    new_record = {
        "inputLocation": location_str,
        "standardizedLocation": geocoded_location,
        "dateRange": {"startDate": start_date_str, "endDate": end_date_str},
        "weatherData": historical_data,
        "userNotes": user_notes,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc)
    }

    try:
        result = history_collection.insert_one(new_record)
        inserted_record = history_collection.find_one({"_id": result.inserted_id})
        # Convert ObjectId to string for JSON serialization
        inserted_record["_id"] = str(inserted_record["_id"])
        return jsonify(inserted_record), 201
    except Exception as e:
        app.logger.error(f"Database insert error: {e}")
        return jsonify({"error": "Failed to store weather history."}), 500


# READ All
@app.route('/api/weather-history', methods=['GET'])
def get_all_weather_history():
    try:
        records = list(history_collection.find().sort("createdAt", -1))
        for record in records: # Convert ObjectId to string
            record["_id"] = str(record["_id"])
        return jsonify(records), 200
    except Exception as e:
        app.logger.error(f"Database read error: {e}")
        return jsonify({"error": "Failed to retrieve weather history."}), 500

# READ One
@app.route('/api/weather-history/<string:record_id>', methods=['GET'])
def get_weather_history_by_id(record_id):
    try:
        if not ObjectId.is_valid(record_id):
            return jsonify({"error": "Invalid record ID format."}), 400
        record = history_collection.find_one({"_id": ObjectId(record_id)})
        if record:
            record["_id"] = str(record["_id"]) # Convert ObjectId
            return jsonify(record), 200
        else:
            return jsonify({"error": "Record not found."}), 404
    except Exception as e:
        app.logger.error(f"Database find_one error: {e}")
        return jsonify({"error": "Failed to retrieve record."}), 500


# UPDATE
@app.route('/api/weather-history/<string:record_id>', methods=['PUT'])
def update_weather_history(record_id):
    if not ObjectId.is_valid(record_id):
        return jsonify({"error": "Invalid record ID format."}), 400

    data = request.get_json()
    if not data:
        return jsonify({"error": "No update data provided."}), 400

    update_fields = {}
    allowed_to_update = ["userNotes"] # Define what users can update directly
    # For location/date changes, you might re-trigger geocoding and historical fetch.
    # For simplicity here, we'll only allow notes to be updated.

    if "userNotes" in data:
        update_fields["userNotes"] = data["userNotes"]

    # Example: If location or dates change, re-validate and re-fetch (more complex)
    # if "location" in data or "startDate" in data or "endDate" in data:
    #     # You would re-run validation and fetch_historical_weather_data logic here
    #     # This makes the update operation more complex.
    #     return jsonify({"error": "Updating location/dates requires re-processing. Not implemented in this simple PUT."}), 501


    if not update_fields:
        return jsonify({"error": "No valid fields to update provided."}), 400

    update_fields["updatedAt"] = datetime.now(timezone.utc)

    try:
        result = history_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": update_fields}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Record not found to update."}), 404
        if result.modified_count == 0 and result.matched_count == 1: # Matched but no changes applied
             return jsonify({"message": "Record found, but no changes applied (data might be the same)."}), 200


        updated_record = history_collection.find_one({"_id": ObjectId(record_id)})
        updated_record["_id"] = str(updated_record["_id"])
        return jsonify(updated_record), 200
    except Exception as e:
        app.logger.error(f"Database update error: {e}")
        return jsonify({"error": "Failed to update record."}), 500


# DELETE
@app.route('/api/weather-history/<string:record_id>', methods=['DELETE'])
def delete_weather_history(record_id):
    if not ObjectId.is_valid(record_id):
        return jsonify({"error": "Invalid record ID format."}), 400
    try:
        result = history_collection.delete_one({"_id": ObjectId(record_id)})
        if result.deleted_count == 1:
            return jsonify({"message": "Record deleted successfully."}), 200 # Or 204 No Content
        else:
            return jsonify({"error": "Record not found or already deleted."}), 404
    except Exception as e:
        app.logger.error(f"Database delete error: {e}")
        return jsonify({"error": "Failed to delete record."}), 500


# == Additional API Integrations ==

@app.route('/api/location-info/<string:location_name>/youtube', methods=['GET'])
def get_youtube_videos(location_name):
    if not YOUTUBE_API_KEY:
        return jsonify({"error": "YouTube API key not configured."}), 501

    params = {
        'part': 'snippet',
        'q': f"{location_name} travel highlights", # Example query
        'type': 'video',
        'maxResults': 5,
        'key': YOUTUBE_API_KEY
    }
    try:
        response = requests.get("https://www.googleapis.com/youtube/v3/search", params=params)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException as e:
        app.logger.error(f"YouTube API error for {location_name}: {e}")
        return jsonify({"error": f"Failed to fetch YouTube videos: {e.response.json().get('error',{}).get('message','') if e.response else str(e)}"}), 502


@app.route('/api/location-info/<string:location_name>/map', methods=['GET'])
def get_google_map_data(location_name):
    # Option 1: Simple Map Embed URL (using Google Maps Embed API)
    if Maps_API_KEY:
        map_url = f"https://www.google.com/maps/embed/v1/place?key={Maps_API_KEY}&q={location_name.replace(' ', '+')}"
        return jsonify({"type": "embed_url", "data": map_url})
    else:
        # Option 2: Geocode and return coordinates for frontend map library
        geocoded = geocode_location_owm(location_name) # Or use Google Geocoding API for better results
        if geocoded:
            return jsonify({"type": "coordinates", "data": geocoded})
        else:
            return jsonify({"error": "Google Maps API key not configured and fallback geocoding failed."}), 501


# == Data Export Example (CSV) ==
@app.route('/api/weather-history/export', methods=['GET'])
def export_weather_history():
    export_format = request.args.get('format', 'json').lower() # Default to JSON

    try:
        records_cursor = history_collection.find({}) # Get all records
        records = list(records_cursor) # Convert cursor to list

        if not records:
            return jsonify({"message": "No data to export."}), 200

        for record in records: # Ensure all ObjectIds are strings for JSON
            record["_id"] = str(record["_id"])
            if 'createdAt' in record and isinstance(record['createdAt'], datetime):
                record['createdAt'] = record['createdAt'].isoformat()
            if 'updatedAt' in record and isinstance(record['updatedAt'], datetime):
                record['updatedAt'] = record['updatedAt'].isoformat()


        if export_format == 'json':
            return jsonify(records), 200
        elif export_format == 'csv':
            if not records:
                return "No data to export", 200

            # Define CSV fieldnames based on a sample record (can be more dynamic)
            # For simplicity, we'll flatten some parts. This can get complex with nested data.
            output = io.StringIO()
            # Dynamically create fieldnames or select specific ones
            # This is a simplified field list. Real-world might need more robust field selection.
            fieldnames = ['_id', 'inputLocation', 'standardizedLocation_name', 'standardizedLocation_lat', 'standardizedLocation_lon', 'startDate', 'endDate', 'userNotes', 'createdAt', 'updatedAt', 'weatherData_summary']

            writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore') # ignore extra fields
            writer.writeheader()

            for record in records:
                flat_record = {
                    '_id': record.get('_id'),
                    'inputLocation': record.get('inputLocation'),
                    'standardizedLocation_name': record.get('standardizedLocation', {}).get('name'),
                    'standardizedLocation_lat': record.get('standardizedLocation', {}).get('lat'),
                    'standardizedLocation_lon': record.get('standardizedLocation', {}).get('lon'),
                    'startDate': record.get('dateRange', {}).get('startDate'),
                    'endDate': record.get('dateRange', {}).get('endDate'),
                    'userNotes': record.get('userNotes'),
                    'createdAt': record.get('createdAt'),
                    'updatedAt': record.get('updatedAt'),
                    # Summarize weatherData or flatten it (can make CSV very wide)
                    'weatherData_summary': str(record.get('weatherData', [])[:1]) + ('...' if len(record.get('weatherData', [])) > 1 else '') # Simple summary
                }
                writer.writerow(flat_record)

            # Prepare response for CSV download
            from flask import Response
            return Response(
                output.getvalue(),
                mimetype="text/csv",
                headers={"Content-disposition": "attachment; filename=weather_history_export.csv"}
            )
        else:
            return jsonify({"error": "Unsupported format. Choose 'json' or 'csv'."}), 400

    except Exception as e:
        app.logger.error(f"Export error: {e}")
        return jsonify({"error": f"Failed to export data: {str(e)}"}), 500

# --- Main ---
if __name__ == '__main__':
    app.logger.setLevel(os.getenv("FLASK_LOG_LEVEL", "INFO")) # Set log level
    app.run(debug=(os.getenv("FLASK_DEBUG", "False").lower() == "true"))