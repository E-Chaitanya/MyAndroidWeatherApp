import React, { useState, useEffect } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import WeatherDisplay from '../components/WeatherDisplay';
import ForecastDisplay from '../components/ForecastDisplay';
import LocationInput from '../components/LocationInput';

function Index() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState('Clear');
  const [location, setLocation] = useState('London');

  // Mock data function for demonstration
  function getMockWeatherData(location: string) {
    const conditions = ["Clear", "Clouds", "Rain", "Snow", "Thunderstorm", "Mist"];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = Math.round(Math.random() * 30 + 5); // 5-35°C
    const humidity = Math.round(Math.random() * 100);
    const windSpeed = Math.round(Math.random() * 10 * 10) / 10; // One decimal place
    
    return {
      name: location,
      main: { 
        temp, 
        feels_like: temp + Math.round(Math.random() * 6 - 3), 
        humidity 
      },
      weather: [{ 
        main: randomCondition, 
        description: `${randomCondition.toLowerCase()} conditions`, 
        icon: "01d" 
      }],
      wind: { speed: windSpeed },
      visibility: Math.round(Math.random() * 10 + 5), // 5-15 km
    };
  }

  function getMockForecastData() {
    const conditions = ["Clear", "Clouds", "Rain", "Snow", "Thunderstorm", "Mist"];
    const forecast = [];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const high = Math.round(Math.random() * 30 + 5);
      const low = high - Math.round(Math.random() * 15 + 5);
      
      forecast.push({
        date: date.toISOString(),
        condition,
        high,
        low,
        description: `${condition.toLowerCase()} conditions`
      });
    }
    
    return forecast;
  }

  const fetchWeather = async (searchLocation: string) => {
    setLoading(true);
    try {
      // Replace with your actual API call to your Flask backend
      // const response = await fetch(`/api/current-weather?location=${searchLocation}`);
      // const forecastResponse = await fetch(`/api/forecast?location=${searchLocation}`);
      // if (!response.ok || !forecastResponse.ok) throw new Error('Failed to fetch weather');
      // const data = await response.json();
      // const forecast = await forecastResponse.json();

      // Mock Data for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      const mockData = getMockWeatherData(searchLocation);
      const mockForecast = getMockForecastData();

      setWeatherData(mockData);
      setForecastData(mockForecast);
      const condition = mockData.weather[0].main;
      setWeatherCondition(condition);
      setLocation(searchLocation);
      setError(null);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
      setForecastData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, []);

  const handleLocationChange = (newLocation: string) => {
    fetchWeather(newLocation);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="text-center text-gray-200">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-300 mx-auto mb-4"></div>
          <p className="text-xl font-light">Loading weather...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center text-gray-200 p-8 rounded-lg bg-gray-800 bg-opacity-50">
          <h2 className="text-2xl font-bold mb-2 text-red-400">Weather Unavailable</h2>
          <p className="text-lg mb-4">Error: {error}</p>
          <button 
            onClick={() => fetchWeather(location)}
            className="bg-gray-700 text-gray-200 px-6 py-2 rounded-full font-semibold hover:bg-gray-600 transition-all border border-gray-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden weather-${weatherCondition?.toLowerCase()} bg-gray-900`}>
      <AnimatedBackground weatherCondition={weatherCondition} />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <LocationInput onLocationChange={handleLocationChange} currentLocation={location} />
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            {weatherData && (
              <>
                <WeatherDisplay 
                  data={weatherData} 
                  weatherCondition={weatherCondition}
                />
                {forecastData.length > 0 && (
                  <ForecastDisplay forecast={forecastData} />
                )}
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-gray-400 text-sm">
            Dynamic weather backgrounds powered by real-time data
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Index;
