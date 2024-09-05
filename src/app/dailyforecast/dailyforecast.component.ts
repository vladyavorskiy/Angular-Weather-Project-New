import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WeatherService } from '../weather.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-dailyforecast',
  templateUrl: './dailyforecast.component.html',
  styleUrls: ['./dailyforecast.component.css']
})
export class DailyforecastComponent implements OnChanges {
  @Input() lat: number | null  = null ;
  @Input() lon: number | null  = null ;
  @Input() timezone: string | null  = null ;

  //dayForecast: any[] = [];
  dayForecast: any[] = [
    ...Array(5).fill({
      date: "None 0 None",  // Дата в формате "День недели, число месяц"
      temperature: "0°C / 0°C",  // Температура днем / ночью
      icon: '/assets/png/0_na_data.png'  // Иконка, соответствующая погоде
    })
  ]
  constructor(private weatherService: WeatherService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lat'] || changes['lon'] || changes['timezone']) {
      this.loadWeatherData();
    }
  }

  loadWeatherData(): void {
    if (this.lat !== null && this.lon !== null && this.timezone) {
      this.weatherService.getDailyForecast(this.lat, this.lon, this.timezone).subscribe(response => {
        this.processForecastData(response, this.timezone!);
      });
    }
  }


  processForecastData(response: any, timezone: string): void {
    try {
      const dayData = response[0].data[0]?.coordinates[0]?.dates || [];
      const nightData = response[1].data[0]?.coordinates[0]?.dates || [];
      const iconData = response[2].data[0]?.coordinates[0]?.dates || [];

      this.dayForecast = dayData.map((entry: any, index: number) => {
        const dayDate = moment.tz(entry.date, timezone);
        const nightDate = moment.tz(nightData[index]?.date, timezone); // Получаем соответствующую ночную дату с учетом часового пояса
        const dayTemp = entry.value;
        const nightTemp = nightData[index]?.value || ''; // Получаем соответствующую ночную температуру
        const iconIndex = iconData[index]?.value || 0; // Индекс иконки погоды

        // Проверяем валидность дат
        if (!dayDate.isValid() || !nightDate.isValid()) {
          throw new Error('Invalid date');
      }
        console.log('day: ', this.dayForecast);
  
        return {
          date: dayDate.format('ddd, D MMM'), // Форматируем дату с использованием moment
          temperature: `${dayTemp} / ${nightTemp}`, // Температура днем / ночью
          icon: this.getWeatherInfo(iconIndex).icon // Используем метод для получения иконки
        };
      });
  
    } catch (error) {
      console.error('Error in processForecastData:', error);
    }
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



