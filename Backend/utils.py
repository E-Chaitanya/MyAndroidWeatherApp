import requests
import os

def get_weather(location):
    api_key = os.getenv("OPENWEATHER_KEY")
    url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
    res = requests.get(url)
    if res.status_code == 200:
        data = res.json()
        return {
            'temperature': data['main']['temp'],
            'description': data['weather'][0]['description']
        }
    return None
def get_youtube_links(location):
    api_key = os.getenv("YOUTUBE_API_KEY")
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={location}+travel&type=video&key={api_key}"
    res = requests.get(url)
    if res.status_code == 200:
        data = res.json()
        return [f"https://www.youtube.com/watch?v={item['id']['videoId']}" for item in data['items']]
    return []

def get_google_maps_url(location):
    return f"https://www.google.com/maps/search/{location.replace(' ', '+')}"
import os
import requests

def get_youtube_links(location):
    api_key = os.getenv("YOUTUBE_API_KEY")
    search_url = (
        f"https://www.googleapis.com/youtube/v3/search"
        f"?part=snippet&q={location}+travel&type=video&maxResults=5&key={api_key}"
    )
    res = requests.get(search_url)
    if res.status_code == 200:
        data = res.json()
        return [f"https://www.youtube.com/watch?v={item['id']['videoId']}" for item in data["items"]]
    return []

def get_google_maps_url(location):
    # Just generates a search link on Google Maps
    return f"https://www.google.com/maps/search/{location.replace(' ', '+')}"
