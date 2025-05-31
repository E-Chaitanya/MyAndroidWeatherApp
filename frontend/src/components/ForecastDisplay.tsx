
import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Zap } from 'lucide-react';

interface ForecastDay {
  date: string;
  condition: string;
  high: number;
  low: number;
  description: string;
}

interface ForecastDisplayProps {
  forecast: ForecastDay[];
}

const ForecastDisplay: React.FC<ForecastDisplayProps> = ({ forecast }) => {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className="w-8 h-8 text-yellow-300" />;
      case 'clouds':
        return <Cloud className="w-8 h-8 text-gray-300" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-8 h-8 text-blue-300" />;
      case 'snow':
        return <CloudSnow className="w-8 h-8 text-white" />;
      case 'thunderstorm':
        return <Zap className="w-8 h-8 text-yellow-300" />;
      default:
        return <Cloud className="w-8 h-8 text-gray-300" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-light mb-6 text-center text-white">5-Day Forecast</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 text-center border border-white border-opacity-20"
          >
            <p className="text-sm font-medium text-white text-opacity-80 mb-2">
              {formatDate(day.date)}
            </p>
            <div className="flex justify-center mb-3">
              {getWeatherIcon(day.condition)}
            </div>
            <div className="mb-2">
              <span className="text-xl font-light text-white">{Math.round(day.high)}°</span>
              <span className="text-sm text-white text-opacity-60 ml-2">{Math.round(day.low)}°</span>
            </div>
            <p className="text-xs text-white text-opacity-70 capitalize">
              {day.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastDisplay;
