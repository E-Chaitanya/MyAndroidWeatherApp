
import React, { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// Simple CSS-only Animation Components
const SunnyAnimation = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-700 to-gray-600">
    <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-500 rounded-full animate-pulse opacity-60"></div>
    <div className="absolute top-12 right-12 w-20 h-20 bg-yellow-400 rounded-full animate-pulse opacity-40"></div>
  </div>
);

const WindyAnimation = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-800">
    <div className="wind-streak"></div>
    <div className="wind-streak"></div>
    <div className="wind-streak"></div>
    <div className="wind-streak"></div>
    <div className="wind-streak"></div>
  </div>
);

const ThunderAnimation = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black">
    <div className="lightning-flash"></div>
  </div>
);

const RainAnimation = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900">
    <div className="rain-container">
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className="rain-drop"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`
          }}
        />
      ))}
    </div>
  </div>
);

interface AnimatedBackgroundProps {
  weatherCondition: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ weatherCondition }) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesOptions = useMemo(() => {
    let options: any = {
      background: {
        color: { value: 'transparent' },
      },
      fpsLimit: 60,
      particles: {
        number: { value: 0 },
      },
      detectRetina: true,
    };

    switch (weatherCondition?.toLowerCase()) {
      case 'clear':
        options.background.color.value = 'transparent';
        break;
        
      case 'clouds':
        options.particles = {
          number: { value: 50, density: { enable: true, area: 800 } },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { 
            value: 0.4, 
            random: { enable: true, minimumValue: 0.2 },
            animation: { enable: true, speed: 0.5, minimumValue: 0.1, sync: false }
          },
          size: { 
            value: { min: 20, max: 80 },
            animation: { enable: true, speed: 2, minimumValue: 20, sync: false }
          },
          move: { 
            enable: true, 
            speed: { min: 0.5, max: 1.5 }, 
            direction: "none", 
            random: true, 
            straight: false, 
            outModes: { default: "out" }
          }
        };
        break;
        
      case 'rain':
      case 'drizzle':
        options.particles = {
          number: { value: 150, density: { enable: true, area: 800 } },
          color: { value: "#adb5bd" },
          shape: { type: "line" },
          opacity: { value: 0.7, random: { enable: true, minimumValue: 0.4 } },
          size: { value: { min: 1, max: 4 } },
          move: {
            enable: true,
            speed: { min: 15, max: 25 },
            direction: "bottom",
            straight: true,
            outModes: { default: "out" },
          },
        };
        break;
        
      case 'snow':
        options.particles = {
          number: { value: 150, density: { enable: true, area: 800 } },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: 0.8, random: { enable: true, minimumValue: 0.4 } },
          size: { value: { min: 1, max: 4 } },
          move: {
            enable: true,
            speed: { min: 1, max: 3 },
            direction: "bottom",
            random: true,
            straight: false,
            outModes: { default: "out" },
            drift: 2
          },
        };
        break;
        
      case 'thunderstorm':
        options.particles = {
          number: { value: 120, density: { enable: true, area: 800 } },
          color: { value: "#adb5bd" },
          shape: { type: "line" },
          opacity: { value: 0.7, random: { enable: true, minimumValue: 0.4 } },
          size: { value: { min: 1, max: 4 } },
          move: { 
            enable: true, 
            speed: { min: 12, max: 20 }, 
            direction: "bottom-left", 
            straight: true, 
            outModes: { default: "out" } 
          },
        };
        break;
        
      case 'mist':
      case 'fog':
      case 'haze':
        options.particles = {
          number: { value: 60, density: { enable: true, area: 800 } },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { 
            value: 0.3, 
            random: { enable: true, minimumValue: 0.1 },
            animation: { enable: true, speed: 0.3, minimumValue: 0.05, sync: false }
          },
          size: { 
            value: { min: 50, max: 120 },
            animation: { enable: true, speed: 1, minimumValue: 40, sync: false }
          },
          move: { 
            enable: true, 
            speed: { min: 0.2, max: 0.8 }, 
            direction: "none", 
            random: true, 
            straight: false, 
            outModes: { default: "out" }
          }
        };
        break;
        
      default:
        options.background.color.value = 'transparent';
        break;
    }
    return options;
  }, [weatherCondition]);

  const getBackgroundComponent = () => {
    switch (weatherCondition?.toLowerCase()) {
      case 'clear':
        return <SunnyAnimation />;
      case 'thunderstorm':
        return <ThunderAnimation />;
      case 'clouds':
        return <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-700" />;
      case 'rain':
      case 'drizzle':
        return <RainAnimation />;
      case 'snow':
        return <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-800" />;
      case 'mist':
      case 'fog':
      case 'haze':
        return <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-700" />;
      default:
        return <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {getBackgroundComponent()}
      {init && (
        <Particles
          id="tsparticles"
          options={particlesOptions}
          className="absolute inset-0"
        />
      )}
    </div>
  );
};

export default AnimatedBackground;
