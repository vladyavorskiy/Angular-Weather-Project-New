// import { Component, OnInit, OnDestroy  } from '@angular/core';
// import { WeatherService } from './weather.service';
// import { GeocodingService } from './geocoding.service';
// import { Observable, Subject } from 'rxjs';
// import { debounceTime, switchMap } from 'rxjs/operators';
// import { format, toZonedTime  } from 'date-fns-tz';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent implements OnInit, OnDestroy {

//   weatherData = {
//     temperature: 0,
//     feel_temperature: 0,
//     uvIndex: 0,
//     windSpeed: 0,
//     pressure: 0,
//     humidity: 0,
//     sunrise: '00:00',
//     sunset: '00:00',
//     city: 'None',
//     time: '00:00',
//     symbol: 0,
//     icon: '/assets/png/0_na_data.png',
//     description: 'No data'
//   };

//   currentDay: string = 'None';
//   currentDate: string = 'None';
//   city: string = 'Surgut';  // Add city property here
//   timezone: string = 'None'; 

//   dayForecast: any[] = [
//     ...Array(5).fill({
//       date: "None 0 None",  // Дата в формате "День недели, число месяц"
//       temperature: "0°C / 0°C",  // Температура днем / ночью
//       icon: '/assets/png/0_na_data.png'  // Иконка, соответствующая погоде
//     })
//   ]
//   hourlyForecast: any[] = [
//     ...Array(5).fill({
//       time: "00:00",
//       temperature: "0°C",
//       windSpeed: "0 m/s",
//       windIcon: '/assets/png/wind_north.png',
//       weatherIcon: '/assets/png/0_na_data.png',
//       backgroundColor: "light-background"
//     })
//   ];
//   private intervalId: any;

//   constructor(
//     private weatherService: WeatherService,
//     private geocodingService: GeocodingService
//   ) {}

//   ngOnInit(): void {
//     this.getWeatherByCity('Surgut');
//   }

//   ngOnDestroy(): void {
//     if (this.intervalId) {
//       clearInterval(this.intervalId);
//     }
//   }

//   getWeatherCurrentLocation(): void {
//     this.geocodingService.getCurrentLocation().subscribe(
//       (location) => {
//         //this.cityName = location.cityName; // Use the city name from the IP response
//         this.weatherData.city = location.cityName;
//         this.geocodingService.getTimezone(location.lat, location.lon).subscribe(
//           (timezone) => {
//             this.timezone = timezone; // Save the timezone
//             this.weatherService.getWeatherData(location.lat, location.lon, timezone).subscribe(
//               (response) => this.processWeatherData(response, timezone),
//               (error) => console.error('Error fetching weather data:', error)
//             );

//             this.weatherService.getDailyForecast(location.lat, location.lon, timezone).subscribe(
//               (forecastResponse) => this.processForecastData(forecastResponse),
//               (error) => console.error('Error fetching forecast data:', error)
//             );

//             this.weatherService.getHourlyForecast(location.lat, location.lon, timezone).subscribe(
//               (hourlyResponse) => this.processHourlyData(hourlyResponse),
//               (error) => console.error('Error fetching hourly forecast data:', error)
//             );
//           },
//           (error) => console.error('Error fetching time zone:', error)
//         );
//       },
//       (error) => console.error('Error fetching location by IP:', error)
//     );
//   }

//   getWeatherByCity(city: string): void {
//     this.city = ''; // Сохраняем часовой пояс
//     this.weatherData.city = city;
//     this.geocodingService.getCoordinates(city).subscribe(
//       (coords) => {
//         this.geocodingService.getTimezone(coords.lat, coords.lon).subscribe(
//           (timezone) => {
//             this.timezone = timezone; // Сохраняем часовой пояс
//             this.weatherService.getWeatherData(coords.lat, coords.lon, timezone).subscribe(
//               (response) => this.processWeatherData(response, timezone),
//               (error) => console.error('Error fetching weather data:', error)
//             );

//             this.weatherService.getDailyForecast(coords.lat, coords.lon, timezone).subscribe(
//               (forecastResponse) => this.processForecastData(forecastResponse),
//               (error) => console.error('Error fetching forecast data:', error)
//             );

//             this.weatherService.getHourlyForecast(coords.lat, coords.lon, timezone).subscribe(
//               (hourlyResponse) => this.processHourlyData(hourlyResponse),
//               (error) => console.error('Error fetching hourly forecast data:', error)
//             );
//           },
//           (error) => console.error('Error fetching time zone:', error)
//         );
//       },
//       (error) => console.error('Error fetching coordinates:', error)
//     );
//   }

  
    

//   processForecastData(response: any): void {
//     try {
//       const dayData = response[0].data[0]?.coordinates[0]?.dates || [];
//       const nightData = response[1].data[0]?.coordinates[0]?.dates || [];
//       const iconData = response[2].data[0]?.coordinates[0]?.dates || [];

//       this.dayForecast = dayData.map((entry: any, index: number) => {
//         const dayDate = new Date(entry.date);
//         const nightDate = new Date(nightData[index]?.date); // Получаем соответствующую ночную дату
//         const dayTemp = entry.value;
//         const nightTemp = nightData[index]?.value || ''; // Получаем соответствующую ночную температуру
//         const iconIndex = iconData[index]?.value || 0; // Индекс иконки погоды

//         // Проверяем валидность дат
//         if (isNaN(dayDate.getTime()) || isNaN(nightDate.getTime())) {
//           throw new Error('Invalid date');
//         }

//         console.log('day: ', this.dayForecast);
  
//         return {
//           date: format(dayDate, 'EEEE d MMM'), // Форматируем дату
//           temperature: `${dayTemp} / ${nightTemp}`, // Температура днем / ночью
//           icon: this.getWeatherInfo(iconIndex).icon // Используем метод для получения иконки
//         };
//       });
  
//     } catch (error) {
//       console.error('Error in processForecastData:', error);
//     }
//   }


  
//   processHourlyData(response: any): void {
//     try {
//       // Извлекаем данные из ответа
//       const temperatureData = response.data.find((d: any) => d.parameter === 't_2m:C')?.coordinates[0]?.dates || [];
//       const windSpeedData = response.data.find((d: any) => d.parameter === 'wind_speed_FL10:ms')?.coordinates[0]?.dates || [];
//       const windDirData = response.data.find((d: any) => d.parameter === 'wind_dir_10m:d')?.coordinates[0]?.dates || [];
//       const weatherIconData = response.data.find((d: any) => d.parameter === 'weather_symbol_20min:idx')?.coordinates[0]?.dates || [];
  
//       // Создаем карту времени к данным для удобного доступа
//       const weatherMap = new Map<string, any>();
  
//       temperatureData.forEach((entry: any) => weatherMap.set(entry.date, { temperature: entry.value }));
//       windSpeedData.forEach((entry: any) => {
//         const data = weatherMap.get(entry.date) || {};
//         data.windSpeed = entry.value;
//         weatherMap.set(entry.date, data);
//       });
//       windDirData.forEach((entry: any) => {
//         const data = weatherMap.get(entry.date) || {};
//         data.windDir = entry.value;
//         weatherMap.set(entry.date, data);
//       });
//       weatherIconData.forEach((entry: any) => {
//         const data = weatherMap.get(entry.date) || {};
//         data.weatherIconIndex = entry.value;
//         weatherMap.set(entry.date, data);
//       });
  
//       // Преобразуем данные в нужный формат
//       this.hourlyForecast = Array.from(weatherMap.entries()).map(([date, data]) => {
//         const time = new Date(date);
//         const formattedTime = format(time, 'HH:mm');
//         const windSpeed = data.windSpeed || 0;
//         const windDir = data.windDir || 0;
//         const weatherIconIndex = data.weatherIconIndex || 0;
//         const isNightTime = time.getHours() >= 21 || time.getHours() < 5;
        
//         console.log('hour: ', this.hourlyForecast);

//         return {
//           time: formattedTime,
//           temperature: `${data.temperature || 'N/A'}°C`,
//           windSpeed: `${windSpeed} m/s`,
//           windIcon: this.getWindDirectionIcon(windDir),
//           weatherIcon: this.getWeatherInfo(weatherIconIndex).icon,
//           backgroundColor: isNightTime ? 'dark-background' : 'light-background'
//         };
//       });
//     } catch (error) {
//       console.error('Error in processHourlyData:', error);
//     }
//   }
  
//   getWindDirectionIcon(degrees: number): string {
//     // Пример простой логики определения иконки направления ветра
//     if (degrees >= 0 && degrees < 22.5) return '/assets/png/wind_north.png';
//     if (degrees >= 22.5 && degrees < 67.5) return '/assets/png/wind_northeast.png';
//     if (degrees >= 67.5 && degrees < 112.5) return '/assets/png/wind_east.png';
//     if (degrees >= 112.5 && degrees < 157.5) return '/assets/png/wind_southeast.png';
//     if (degrees >= 157.5 && degrees < 202.5) return '/assets/png/wind_south.png';
//     if (degrees >= 202.5 && degrees < 247.5) return '/assets/png/wind_southwest.png';
//     if (degrees >= 247.5 && degrees < 292.5) return '/assets/png/wind_west.png';
//     if (degrees >= 292.5 && degrees < 337.5) return '/assets/png/wind_northwest.png';
//     return '/assets/png/wind_north.png';
//   }

//   getWeatherInfo(iconIndex: number): { icon: string, description: string } {
//     const weatherMap: { [key: number]: { icon: string, description: string } } = {
//       0: { icon: '/assets/png/0_na_data.png', description: 'No Data' },
//     1: { icon: '/assets/png/1_clear_sky_day.png', description: 'Clear Sky (Day)' },
//     2: { icon: '/assets/png/2_light_clouds_day.png', description: 'Light Clouds (Day)' },
//     3: { icon: '/assets/png/3_partly_cloudy_day.png', description: 'Partly Cloudy (Day)' },
//     4: { icon: '/assets/png/4_104_cloudy.png', description: 'Cloudy' },
//     5: { icon: '/assets/png/5_105_rain.png', description: 'Rain' },
//     6: { icon: '/assets/png/6_106_rain_and_snow.png', description: 'Rain and Snow' },
//     7: { icon: '/assets/png/7_107_snow.png', description: 'Snow' },
//     8: { icon: '/assets/png/8_rain_shower_day.png', description: 'Rain Shower (Day)' },
//     9: { icon: '/assets/png/9_snow_shower_day.png', description: 'Snow Shower (Day)' },
//     10: { icon: '/assets/png/10_sleet_shower_day.png', description: 'Sleet Shower (Day)' },
//     11: { icon: '/assets/png/11_light_fog_day.png', description: 'Light Fog (Day)' },
//     12: { icon: '/assets/png/12_112_dense_fog.png', description: 'Dense Fog' },
//     13: { icon: '/assets/png/13_113_freezing_rain.png', description: 'Freezing Rain' },
//     14: { icon: '/assets/png/14_114_thunderstorms.png', description: 'Thunderstorms' },
//     15: { icon: '/assets/png/15_115_drizzle.png', description: 'Drizzle' },
//     16: { icon: '/assets/png/16_116_sandstorm.png', description: 'Sandstorm' },
//     101: { icon: '/assets/png/101_clear_sky_night.png', description: 'Clear Sky (Night)' },
//     102: { icon: '/assets/png/102_light_clouds_night.png', description: 'Light Clouds (Night)' },
//     103: { icon: '/assets/png/103_partly_cloudy_night.png', description: 'Partly Cloudy (Night)' },
//     104: { icon: '/assets/png/4_104_cloudy.png', description: 'Cloudy' },
//     105: { icon: '/assets/png/5_105_rain.png', description: 'Rain' },
//     106: { icon: '/assets/png/6_106_rain_and_snow.png', description: 'Rain and Snow' },
//     107: { icon: '/assets/png/7_107_snow.png', description: 'Snow' },
//     108: { icon: '/assets/png/108_rain_shower_night.png', description: 'Rain Shower (Night)' },
//     109: { icon: '/assets/png/109_snow_shower_night.png', description: 'Snow Shower (Night)' },
//     110: { icon: '/assets/png/110_sleet_shower_night.png', description: 'Sleet Shower (Night)' },
//     111: { icon: '/assets/png/111_light_fog_night.png', description: 'Light Fog (Night)' },
//     112: { icon: '/assets/png/12_112_dense_fog.png', description: 'Dense Fog' },
//     113: { icon: '/assets/png/13_113_freezing_rain.png', description: 'Freezing Rain' },
//     114: { icon: '/assets/png/14_114_thunderstorms.png', description: 'Thunderstorms' },
//     115: { icon: '/assets/png/15_115_drizzle.png', description: 'Drizzle' },
//     116: { icon: '/assets/png/16_116_sandstorm.png', description: 'Sandstorm' },
//   };
  
//   return weatherMap[iconIndex] || { icon: '/assets/png/0_na_data.png', description: 'Unknown Weather' };
//   }


//   processWeatherData(response: any, timezone: string): void {
//     const data = response.data;

//     this.weatherData.temperature = data.find((d: any) => d.parameter === 't_2m:C').coordinates[0].dates[0].value;
//     this.weatherData.feel_temperature = data.find((d: any) => d.parameter === 't_apparent:C').coordinates[0].dates[0].value;
//     this.weatherData.uvIndex = data.find((d: any) => d.parameter === 'uv:idx').coordinates[0].dates[0].value;
//     this.weatherData.windSpeed = data.find((d: any) => d.parameter === 'wind_speed_FL10:ms').coordinates[0].dates[0].value;
//     this.weatherData.pressure = 0.75 * data.find((d: any) => d.parameter === 'pressure_100m:hPa').coordinates[0].dates[0].value;
//     this.weatherData.humidity = data.find((d: any) => d.parameter === 'relative_humidity_2m:p').coordinates[0].dates[0].value;

//     this.weatherData.sunrise = this.formatUTCToTimeInZone(data.find((d: any) => d.parameter === 'sunrise:sql').coordinates[0].dates[0].value, timezone);
//     this.weatherData.sunset = this.formatUTCToTimeInZone(data.find((d: any) => d.parameter === 'sunset:sql').coordinates[0].dates[0].value, timezone);
//     //this.weatherData.city = this.cityName;
//     this.weatherData.symbol = data.find((d: any) => d.parameter === 'weather_symbol_20min:idx').coordinates[0].dates[0].value;
//     const weatherInfo = this.getWeatherInfo(this.weatherData.symbol);
//     this.weatherData.icon = weatherInfo.icon;
//     this.weatherData.description = weatherInfo.description;

//     // const DateTime = this.getLocalTimeInCity(timezone);
//     // this.weatherData.time = DateTime.time;
//     // this.currentDay = DateTime.dayOfWeek;
//     // this.currentDate = DateTime.date;

//     this.startRealTimeClock(); // Запускаем обновление времени в реальном времени
//   }


//   startRealTimeClock(): void {
//     this.updateDateTime();
//     if (this.intervalId) {
//       clearInterval(this.intervalId);
//     }
//     this.intervalId = setInterval(() => this.updateDateTime(), 1000); // Обновляем каждую секунду
//   }

//   updateDateTime(): void {
//     const localTimeData = this.getLocalTimeInCity(this.timezone);
//     this.weatherData.time = localTimeData.time;
//     this.currentDay = localTimeData.dayOfWeek;
//     this.currentDate = localTimeData.date;
//   }

//   public getLocalTimeInCity(timezone: string): { time: string; date: string; dayOfWeek: string } {
//     // Получаем текущее время в UTC
//     const utcNow = new Date();
  
//     // Преобразуем UTC время в локальное время по заданному часовому поясу
//     const zonedTime = toZonedTime(utcNow, timezone);
  
//     // Форматируем локальное время и дату
//     const timeFormat = 'HH:mm:ss'; // Часы, минуты и секунды
//     const dateFormat = 'yyyy-MM-dd'; // Год-месяц-день
//     const dayOfWeekFormat = 'EEEE'; // Полное название дня недели
  
//     const time = format(zonedTime, timeFormat, { timeZone: timezone });
//     const date = format(zonedTime, dateFormat, { timeZone: timezone });
//     const dayOfWeek = format(zonedTime, dayOfWeekFormat, { timeZone: timezone });
  
//     return {
//       time,
//       date,
//       dayOfWeek
//     };
//   }



// public formatUTCToTimeInZone(utcDateString: string, timezone: string): string {
//   // Преобразуем строку даты в объект Date
//   const date = new Date(utcDateString);
  
//   // Преобразуем UTC время в локальное время по заданному часовому поясу
//   const zonedDate = toZonedTime(date, timezone);
  
//   // Форматируем время в "HH:mm"
//   const time = format(zonedDate, 'HH:mm', { timeZone: timezone });
  
//   return time;
// }



// }





import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
}