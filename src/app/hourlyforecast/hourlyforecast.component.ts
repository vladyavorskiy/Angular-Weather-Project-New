import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WeatherService } from '../weather.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-hourlyforecast',
  templateUrl: './hourlyforecast.component.html',
  styleUrls: ['./hourlyforecast.component.css']
})
export class HourlyforecastComponent implements OnChanges{
  @Input() lat: number | null  = null ;
  @Input() lon: number | null  = null ;
  @Input() timezone: string | null  = null ;

  //hourlyForecast: any[] = [];
  hourlyForecast: any[] = [
    ...Array(5).fill({
      time: "00:00",
      temperature: "0°C",
      windSpeed: "0 m/s",
      windIcon: '/assets/png/wind_north.png',
      weatherIcon: '/assets/png/0_na_data.png',
      backgroundColor: "light-background"
    })
  ];
  
  constructor(private weatherService: WeatherService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lat'] || changes['lon'] || changes['timezone']) {
      this.loadWeatherData();
    }
  }

  loadWeatherData(): void {
    if (this.lat !== null && this.lon !== null && this.timezone) {
      this.weatherService.getHourlyForecast(this.lat, this.lon, this.timezone).subscribe(response => {
        this.processHourlyData(response, this.timezone!);
      });
    }
  }


  processHourlyData(response: any, timezone: string): void {
    try {
      console.log("response hour: ", response);
      this.hourlyForecast = [];
      // Извлекаем данные из ответа
      const temperatureData = response.data.find((d: any) => d.parameter === 't_2m:C')?.coordinates[0]?.dates || [];
      const windSpeedData = response.data.find((d: any) => d.parameter === 'wind_speed_FL10:ms')?.coordinates[0]?.dates || [];
      const windDirData = response.data.find((d: any) => d.parameter === 'wind_dir_10m:d')?.coordinates[0]?.dates || [];
      const weatherIconData = response.data.find((d: any) => d.parameter === 'weather_symbol_20min:idx')?.coordinates[0]?.dates || [];
  
      // Создаем карту времени к данным для удобного доступа
      const weatherMap = new Map<string, any>();
  
      temperatureData.forEach((entry: any) => weatherMap.set(entry.date, { temperature: entry.value }));
      windSpeedData.forEach((entry: any) => {
        const data = weatherMap.get(entry.date) || {};
        data.windSpeed = entry.value;
        weatherMap.set(entry.date, data);
      });
      windDirData.forEach((entry: any) => {
        const data = weatherMap.get(entry.date) || {};
        data.windDir = entry.value;
        weatherMap.set(entry.date, data);
      });
      weatherIconData.forEach((entry: any) => {
        const data = weatherMap.get(entry.date) || {};
        data.weatherIconIndex = entry.value;
        weatherMap.set(entry.date, data);
      });

      console.log("weatherMap: ", weatherMap);

  
      // Преобразуем данные в нужный формат
      this.hourlyForecast = Array.from(weatherMap.entries()).map(([date, data]) => {
        const time = moment(date).tz(timezone); // Укажите нужный вам часовой пояс
        const formattedTime = time.format('HH:mm');
        const windSpeed = data.windSpeed || 0;
        const windDir = data.windDir || 0;
        const weatherIconIndex = data.weatherIconIndex || 0;
        const isNightTime = time.hours() >= 21 || time.hours() < 5;
        
        console.log('hour: ', this.hourlyForecast);
        return {
          time: formattedTime,
          temperature: `${data.temperature || 'N/A'}°C`,
          windSpeed: `${windSpeed} m/s`,
          windIcon: this.getWindDirectionIcon(windDir),
          weatherIcon: this.getWeatherInfo(weatherIconIndex).icon,
          backgroundColor: isNightTime ? 'dark-background' : 'light-background'
        };
      });
    } catch (error) {
      console.error('Error in processHourlyData:', error);
    }
  }

  getWindDirectionIcon(degrees: number): string {
    // Пример простой логики определения иконки направления ветра
    if (degrees >= 0 && degrees < 22.5) return '/assets/png/wind_north.png';
    if (degrees >= 22.5 && degrees < 67.5) return '/assets/png/wind_northeast.png';
    if (degrees >= 67.5 && degrees < 112.5) return '/assets/png/wind_east.png';
    if (degrees >= 112.5 && degrees < 157.5) return '/assets/png/wind_southeast.png';
    if (degrees >= 157.5 && degrees < 202.5) return '/assets/png/wind_south.png';
    if (degrees >= 202.5 && degrees < 247.5) return '/assets/png/wind_southwest.png';
    if (degrees >= 247.5 && degrees < 292.5) return '/assets/png/wind_west.png';
    if (degrees >= 292.5 && degrees < 337.5) return '/assets/png/wind_northwest.png';
    return '/assets/png/wind_north.png';
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
}
