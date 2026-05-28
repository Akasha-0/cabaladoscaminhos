export type WeatherCondition =
  | 'clear'
  | 'cloudy'
  | 'rain'
  | 'snow'
  | 'storm'
  | 'fog'
  | 'wind';

export interface WeatherData {
  id: string;
  timestamp: Date;
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: WeatherCondition;
  description: string;
  feelsLike: number;
  dewPoint: number;
  cloudCover: number;
  precipitation: number;
  sunrise?: Date;
  sunset?: Date;
  hourlyForecast?: HourlyForecast[];
  alertCount: number;
}

export interface HourlyForecast {
  timestamp: Date;
  temperature: number;
  condition: WeatherCondition;
  precipitation: number;
  humidity: number;
}

export interface WeatherAlert {
  id: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  event: string;
  headline: string;
  description: string;
  start: Date;
  end: Date;
}

function getWeatherData(): WeatherData {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    location: 'São Paulo, Brazil',
    latitude: -23.5505,
    longitude: -46.6333,
    temperature: 22,
    humidity: 65,
    windSpeed: 12,
    windDirection: 270,
    pressure: 1013,
    visibility: 10000,
    uvIndex: 6,
    condition: 'clear',
    description: 'Clear sky',
    feelsLike: 21,
    dewPoint: 15,
    cloudCover: 10,
    precipitation: 0,
    alertCount: 0,
  };
}

export { getWeatherData };
