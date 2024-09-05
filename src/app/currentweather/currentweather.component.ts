import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WeatherService } from '../weather.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-currentweather',
  templateUrl: './currentweather.component.html',
  styleUrls: ['./currentweather.component.css']
})
export class CurrentWeatherComponent implements OnChanges {
  @Input() lat: number | null  = null ;
  @Input() lon: number | null  = null ;
  @Input() timezone: string | null  = null ;

  weatherData = {
    temperature: 0,
    feel_temperature: 0,
    uvIndex: 0,
    windSpeed: 0,
    pressure: 0,
    humidity: 0,
    sunrise: '00:00',
    sunset: '00:00',
    city: 'None',
    time: '00:00',
    symbol: 0,
    icon: '/assets/png/0_na_data.png',
    description: 'No data'
  };

  constructor(private weatherService: WeatherService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lat'] || changes['lon'] || changes['timezone']) {
      this.loadWeatherData();
    }
  }

  loadWeatherData(): void {
    if (this.lat !== null && this.lon !== null && this.timezone) {
      this.weatherService.getWeatherData(this.lat, this.lon, this.timezone).subscribe(response => {
        this.processWeatherData(response, this.timezone!);
      });
    }
  }


  processWeatherData(response: any, timezone: string): void {
    const data = response.data;

    this.weatherData.temperature = data.find((d: any) => d.parameter === 't_2m:C').coordinates[0].dates[0].value;
    this.weatherData.feel_temperature = data.find((d: any) => d.parameter === 't_apparent:C').coordinates[0].dates[0].value;
    this.weatherData.uvIndex = data.find((d: any) => d.parameter === 'uv:idx').coordinates[0].dates[0].value;
    this.weatherData.windSpeed = data.find((d: any) => d.parameter === 'wind_speed_FL10:ms').coordinates[0].dates[0].value;
    this.weatherData.pressure = 0.75 * data.find((d: any) => d.parameter === 'pressure_100m:hPa').coordinates[0].dates[0].value;
    this.weatherData.humidity = data.find((d: any) => d.parameter === 'relative_humidity_2m:p').coordinates[0].dates[0].value;

    this.weatherData.sunrise = this.formatUTCToTimeInZone(data.find((d: any) => d.parameter === 'sunrise:sql').coordinates[0].dates[0].value, timezone);
    this.weatherData.sunset = this.formatUTCToTimeInZone(data.find((d: any) => d.parameter === 'sunset:sql').coordinates[0].dates[0].value, timezone);
    this.weatherData.symbol = data.find((d: any) => d.parameter === 'weather_symbol_20min:idx').coordinates[0].dates[0].value;

    const weatherInfo = this.getWeatherInfo(this.weatherData.symbol);
    this.weatherData.icon = weatherInfo.icon;
    this.weatherData.description = weatherInfo.description;

    }

    
  getWeatherInfo(iconIndex: number): { icon: string, description: string } {
    const weatherMap: { [key: number]: { icon: string, description: string } } = {
      0: { icon: '/assets/png/0_na_data.png', description: 'No Data' },
    1: { icon: '/assets/png/1_clear_sky_day.png', description: 'Clear Sky' },
    2: { icon: '/assets/png/2_light_clouds_day.png', description: 'Light Clouds' },
    3: { icon: '/assets/png/3_partly_cloudy_day.png', description: 'Partly Cloudy' },
    4: { icon: '/assets/png/4_104_cloudy.png', description: 'Cloudy' },
    5: { icon: '/assets/png/5_105_rain.png', description: 'Rain' },
    6: { icon: '/assets/png/6_106_rain_and_snow.png', description: 'Rain and Snow' },
    7: { icon: '/assets/png/7_107_snow.png', description: 'Snow' },
    8: { icon: '/assets/png/8_rain_shower_day.png', description: 'Rain Shower' },
    9: { icon: '/assets/png/9_snow_shower_day.png', description: 'Snow Shower' },
    10: { icon: '/assets/png/10_sleet_shower_day.png', description: 'Sleet Shower' },
    11: { icon: '/assets/png/11_light_fog_day.png', description: 'Light Fog' },
    12: { icon: '/assets/png/12_112_dense_fog.png', description: 'Dense Fog' },
    13: { icon: '/assets/png/13_113_freezing_rain.png', description: 'Freezing Rain' },
    14: { icon: '/assets/png/14_114_thunderstorms.png', description: 'Thunderstorms' },
    15: { icon: '/assets/png/15_115_drizzle.png', description: 'Drizzle' },
    16: { icon: '/assets/png/16_116_sandstorm.png', description: 'Sandstorm' },
    101: { icon: '/assets/png/101_clear_sky_night.png', description: 'Clear Sky' },
    102: { icon: '/assets/png/102_light_clouds_night.png', description: 'Light Clouds' },
    103: { icon: '/assets/png/103_partly_cloudy_night.png', description: 'Partly Cloudy' },
    104: { icon: '/assets/png/4_104_cloudy.png', description: 'Cloudy' },
    105: { icon: '/assets/png/5_105_rain.png', description: 'Rain' },
    106: { icon: '/assets/png/6_106_rain_and_snow.png', description: 'Rain and Snow' },
    107: { icon: '/assets/png/7_107_snow.png', description: 'Snow' },
    108: { icon: '/assets/png/108_rain_shower_night.png', description: 'Rain Shower' },
    109: { icon: '/assets/png/109_snow_shower_night.png', description: 'Snow Shower' },
    110: { icon: '/assets/png/110_sleet_shower_night.png', description: 'Sleet Shower' },
    111: { icon: '/assets/png/111_light_fog_night.png', description: 'Light Fog' },
    112: { icon: '/assets/png/12_112_dense_fog.png', description: 'Dense Fog' },
    113: { icon: '/assets/png/13_113_freezing_rain.png', description: 'Freezing Rain' },
    114: { icon: '/assets/png/14_114_thunderstorms.png', description: 'Thunder-storms' },
    115: { icon: '/assets/png/15_115_drizzle.png', description: 'Drizzle' },
    116: { icon: '/assets/png/16_116_sandstorm.png', description: 'Sandstorm' },
  };
  
  return weatherMap[iconIndex] || { icon: '/assets/png/0_na_data.png', description: 'Unknown Weather' };
  }


  public formatUTCToTimeInZone(utcDateString: string, timezone: string): string {
    // Преобразуем строку даты в объект moment с временной зоной UTC
    const utcMoment = moment.utc(utcDateString);

    // Преобразуем момент в заданный часовой пояс и форматируем в "HH:mm"
    const time = utcMoment.tz(timezone).format('HH:mm');

    return time;
}
}
