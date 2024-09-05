import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of  } from 'rxjs';
import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = 'https://api.meteomatics.com';

  constructor(private http: HttpClient) {}


  getWeatherData(lat: number, lon: number, timezone: string): Observable<any> {
    //Получаем текущее время в указанном временном поясе
    console.log('TZ name:', timezone); // Выводим текущие дату и время

    const currentTime = moment().tz(timezone).format('YYYY-MM-DDTHH:mm:ssZ');
    console.log('Current Time:', currentTime); // Выводим текущие дату и время
    const timezoneAbbreviation = moment.tz(timezone).format('z'); // Получаем "BST" или "GMT"
    console.log('TZ Abb:', timezoneAbbreviation); // Выводим текущие дату и время


    // Формируем URL для запроса
    const url = `${this.apiUrl}/${currentTime}/t_2m:C,t_apparent:C,uv:idx,wind_speed_FL10:ms,pressure_100m:hPa,relative_humidity_2m:p,sunrise:sql,sunset:sql,weather_symbol_20min:idx/${lat},${lon}/json`;
    console.log('API URL:', url); // Выводим сформированный URL

    // Отправляем HTTP GET запрос
    return this.http.get(url, {
      headers: {
        Authorization: 'Basic ' + btoa('-_javorskij_vladisla:41uDR9cOGv') // Replace with your credentials
      }
    });



    
    const mockData = {
      temperature: 25,
      feel_temperature: 23,
      uvIndex: 2,
      windSpeed: 10,
      pressure: 1000,
      humidity: 77,
      sunrise: '12:50',
      sunset: '19:20',
      city: 'Surgut',
      time: '21:05',
      symbol: 1,
      icon: '',
      description: ''
    };
  
    // Возвращаем Observable с заглушкой данных
    return of(mockData);
  }




  getDailyForecast(lat: number, lon: number, timezone: string): Observable<any> {
    const dayTime = moment().add(1, 'days').tz(timezone).set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DDTHH:mm:ssZ');
    const nightTime = moment().add(1, 'days').tz(timezone).set({ hour: 22, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DDTHH:mm:ssZ');
    const endDateNight = moment().add(5, 'days').tz(timezone).set({ hour: 22, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DDTHH:mm:ssZ');
    const endDateDay = moment().add(5, 'days').tz(timezone).set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DDTHH:mm:ssZ');
  
    const dayUrl = `${this.apiUrl}/${dayTime}--${endDateDay}:P1D/t_2m:C/${lat},${lon}/json`;
    const nightUrl = `${this.apiUrl}/${nightTime}--${endDateNight}:P1D/t_2m:C/${lat},${lon}/json`;
    const iconUrl = `${this.apiUrl}/${dayTime}--${endDateDay}:P1D/weather_symbol_20min:idx/${lat},${lon}/json`;

    console.log('Day URL:', dayUrl);
    console.log('Night URL:', nightUrl);
    console.log('Icon URL:', iconUrl);

  
    const dayRequest = this.http.get(dayUrl, {
      headers: {
        Authorization: 'Basic ' + btoa('-_javorskij_vladisla:41uDR9cOGv')
      }
    });
  
    const nightRequest = this.http.get(nightUrl, {
      headers: {
        Authorization: 'Basic ' + btoa('-_javorskij_vladisla:41uDR9cOGv')
      }
    });

    const iconRequest = this.http.get(iconUrl, {
      headers: {
        Authorization: 'Basic ' + btoa('-_javorskij_vladisla:41uDR9cOGv')
      }
    });
  
    //Выполняем оба запроса параллельно и комбинируем результаты
    return forkJoin([dayRequest, nightRequest, iconRequest]);
  
  const mockDayData = {
    dayTemperature: [20, 22, 23, 24, 25],
    nightTemperature: [15, 16, 17, 18, 19],
    weatherIcons: ['sunny', 'cloudy', 'rainy', 'sunny', 'sunny']
  };

  // Возвращаем Observable с заглушкой данных
  return of([mockDayData.dayTemperature, mockDayData.nightTemperature, mockDayData.weatherIcons]);
}



getHourlyForecast(lat: number, lon: number, timezone: string): Observable<any> {
  // const startTime = moment().tz(timezone).set({ minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DDTHH:mm:ssZ');
  // const endTime = moment().add(1, 'days').tz(timezone).set({ hour: 4, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DDTHH:mm:ssZ');
  //const hourlyUrl = `${this.apiUrl}/${startTime}--${endTime}:PT1H/t_2m:C,wind_speed_FL10:ms,wind_dir_10m:d,weather_symbol_20min:idx/${lat},${lon}/json`;

  const startTime = moment().tz(timezone).set({ minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DDTHH:mm:ssZ');
  const now = moment().tz(timezone);
  let endTime: string;

  if (now.hour() >= 0 && now.hour() < 20) {
    // Текущее время между 00:00 и 20:00
    endTime = moment().add(1, 'days').tz(timezone).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DDTHH:mm:ssZ');
  } else {
    // Текущее время между 20:00 и 00:00
    endTime = moment().add(1, 'days').tz(timezone).set({ hour: 3, minute: 0, second: 0, millisecond: 0 }).format('YYYY-MM-DDTHH:mm:ssZ');
  }
  console.log('now: ', now);
  console.log('start: ', startTime);
  console.log('end: ', endTime);

  const hourlyUrl = `${this.apiUrl}/${startTime}--${endTime}:PT1H/t_2m:C,wind_speed_FL10:ms,wind_dir_10m:d,weather_symbol_20min:idx/${lat},${lon}/json`;
  console.log('Hourly URL:', hourlyUrl);

  return this.http.get(hourlyUrl, {
    headers: {
      Authorization: 'Basic ' + btoa('-_javorskij_vladisla:41uDR9cOGv')
    }
  });

  const mockHourData = [
    {
      temperature: 15.3,
      feel_temperature: 14.5,
      uvIndex: 1,
      windSpeed: 3.2,
      pressure: 1012,
      humidity: 85,
      time: '00:00',
      symbol: 101,
      icon: '', // Здесь можно указать URL иконки или оставить пустым
      description: 'Clear sky'
    },
    {
      temperature: 14.8,
      feel_temperature: 14.0,
      uvIndex: 1,
      windSpeed: 2.9,
      pressure: 1011,
      humidity: 87,
      time: '01:00',
      symbol: 102,
      icon: '',
      description: 'Partly cloudy'
    },
    {
      temperature: 14.5,
      feel_temperature: 13.8,
      uvIndex: 0,
      windSpeed: 3.0,
      pressure: 1010,
      humidity: 88,
      time: '02:00',
      symbol: 103,
      icon: '',
      description: 'Cloudy'
    },
    {
      temperature: 14.2,
      feel_temperature: 13.5,
      uvIndex: 0,
      windSpeed: 3.1,
      pressure: 1009,
      humidity: 89,
      time: '03:00',
      symbol: 104,
      icon: '',
      description: 'Light rain'
    },
    {
      temperature: 14.0,
      feel_temperature: 13.3,
      uvIndex: 0,
      windSpeed: 3.0,
      pressure: 1008,
      humidity: 90,
      time: '04:00',
      symbol: 105,
      icon: '',
      description: 'Heavy rain'
    }
  ];
  // Возвращаем Observable с заглушкой данных
  return of(mockHourData);
}
  
}
