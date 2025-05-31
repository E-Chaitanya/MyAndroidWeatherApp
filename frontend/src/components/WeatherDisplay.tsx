
import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Zap, Eye } from 'lucide-react';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility?: number;
}

interface WeatherDisplayProps {
  data: WeatherData;
  weatherCondition: string;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ data, weatherCondition }) => {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="w-16 h-16 text-yellow-300" />;
      case 'clouds':
        return <Cloud className="w-16 h-16 text-gray-300" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-16 h-16 text-blue-300" />;
      case 'snow':
        return <CloudSnow className="w-16 h-16 text-white" />;
      case 'thunderstorm':
        return <Zap className="w-16 h-16 text-yellow-300" />;
      default:
        return <Cloud className="w-16 h-16 text-gray-300" />;
    }
  };

  return (
    <div className="text-center text-white">
      {/* Main Weather Card */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 mb-6 shadow-2xl border border-white border-opacity-20">
        <h1 className="text-4xl font-light mb-2">{data.name}</h1>
        <div className="flex items-center justify-center mb-6">
          {getWeatherIcon(weatherCondition)}
        </div>
        <div className="text-7xl font-extralight mb-2">
          {Math.round(data.main.temp)}°
        </div>
        <p className="text-xl text-white text-opacity-80 capitalize mb-4">
          {data.weather[0].description}
        </p>
        <p className="text-lg text-white text-opacity-70">
          Feels like {Math.round(data.main.feels_like)}°
        </p>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Humidity Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
          <div className="text-3xl font-light mb-2">{data.main.humidity}%</div>
          <p className="text-white text-opacity-70">Humidity</p>
        </div>

        {/* Wind Speed Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
          <div className="text-3xl font-light mb-2">{data.wind.speed} m/s</div>
          <p className="text-white text-opacity-70">Wind Speed</p>
        </div>

        {/* Visibility Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
          <div className="flex items-center justify-center mb-2">
            <Eye className="w-8 h-8 mr-2" />
            <span className="text-3xl font-light">
              {data.visibility ? `${data.visibility}km` : 'N/A'}
            </span>
          </div>
          <p className="text-white text-opacity-70">Visibility</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;
