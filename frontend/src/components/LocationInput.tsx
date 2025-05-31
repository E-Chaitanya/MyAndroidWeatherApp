import React, { useState } from 'react';
import { MapPin, Search, Navigation, Building2, Map } from 'lucide-react';

interface LocationInputProps {
  onLocationChange: (location: string) => void;
  currentLocation: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ onLocationChange, currentLocation }) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onLocationChange(inputValue.trim());
      setInputValue('');
      setIsOpen(false);
    }
  };

  const searchSuggestions = {
    popularCities: [
      'London', 'New York', 'Tokyo', 'Paris', 'Sydney', 
      'Dubai', 'Singapore', 'Los Angeles', 'Berlin', 'Mumbai'
    ],
    landmarks: [
      'Eiffel Tower, Paris',
      'Times Square, New York',
      'Big Ben, London',
      'Golden Gate Bridge, San Francisco',
      'Statue of Liberty, New York',
      'Empire State Building, New York'
    ],
    zipCodes: [
      '10001, New York',
      '90210, Beverly Hills',
      'SW1A 1AA, London',
      '75001, Paris',
      '100-0001, Tokyo'
    ]
  };

  const handleSuggestionClick = (suggestion: string) => {
    onLocationChange(suggestion);
    setIsOpen(false);
  };

  return (
    <div className="relative max-w-md mx-auto">
      {/* Current Location Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-full bg-white bg-opacity-10 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-200"
      >
        <MapPin className="w-5 h-5 mr-2" />
        <span className="font-medium">{currentLocation}</span>
        <Search className="w-5 h-5 ml-2" />
      </button>

      {/* Search Panel */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 p-4 shadow-2xl z-20 max-h-96 overflow-y-auto">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="City, ZIP code, coordinates, landmark..."
                className="w-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 px-4 py-3 rounded-xl border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-all"
              >
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>

          {/* Search Tips */}
          <div className="mb-4 p-3 bg-white bg-opacity-5 rounded-lg">
            <p className="text-white text-opacity-70 text-xs mb-2">Search examples:</p>
            <div className="grid grid-cols-1 gap-1 text-xs text-white text-opacity-60">
              <div>• City: "London", "New York", "Tokyo"</div>
              <div>• ZIP/Postal: "10001", "SW1A 1AA", "90210"</div>
              <div>• Coordinates: "40.7128,-74.0060"</div>
              <div>• Landmarks: "Eiffel Tower", "Times Square"</div>
            </div>
          </div>

          {/* Popular Cities */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Building2 className="w-4 h-4 text-white text-opacity-70 mr-2" />
              <p className="text-white text-opacity-70 text-sm">Popular Cities</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {searchSuggestions.popularCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleSuggestionClick(city)}
                  className="text-left text-white text-sm p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Famous Landmarks */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Map className="w-4 h-4 text-white text-opacity-70 mr-2" />
              <p className="text-white text-opacity-70 text-sm">Famous Landmarks</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {searchSuggestions.landmarks.map((landmark) => (
                <button
                  key={landmark}
                  onClick={() => handleSuggestionClick(landmark)}
                  className="text-left text-white text-sm p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
                >
                  {landmark}
                </button>
              ))}
            </div>
          </div>

          {/* ZIP Code Examples */}
          <div>
            <div className="flex items-center mb-2">
              <Navigation className="w-4 h-4 text-white text-opacity-70 mr-2" />
              <p className="text-white text-opacity-70 text-sm">ZIP/Postal Codes</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {searchSuggestions.zipCodes.map((zipCode) => (
                <button
                  key={zipCode}
                  onClick={() => handleSuggestionClick(zipCode)}
                  className="text-left text-white text-sm p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
                >
                  {zipCode}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LocationInput;