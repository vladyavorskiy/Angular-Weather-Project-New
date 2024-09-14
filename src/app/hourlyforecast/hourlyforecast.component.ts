import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WeatherService } from '../weather.service';
import * as moment from 'moment-timezone';
import { IconsService } from '../icons.service';

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
  
  constructor(private weatherService: WeatherService, 
              private iconsService: IconsService) {}

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
          windIcon: this.iconsService.getWindDirectionIcon(windDir),
          weatherIcon: this.iconsService.getWeatherInfo(weatherIconIndex).icon,
          backgroundColor: isNightTime ? 'dark-background' : 'light-background'
        };
      });
    } catch (error) {
      console.error('Error in processHourlyData:', error);
    }
  }

}
