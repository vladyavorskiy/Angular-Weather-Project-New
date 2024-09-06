import { Component, HostListener, ElementRef, AfterViewInit, OnInit   } from '@angular/core';
import { Router } from '@angular/router';
import { WeatherService } from '../weather.service';
import { Observable, forkJoin } from 'rxjs';
import { FavouriteService } from '../favourite.service';
import { map } from 'rxjs/operators';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.css']
})
export class FavouritesComponent implements AfterViewInit, OnInit {

  cityName: string = '';
  lat: number | null = null;
  lon: number | null = null;
  timezone: string = '';
  showScrollButtons: boolean = false; // Флаг для отображения кнопок

  constructor(
    private router: Router, 
    private elRef: ElementRef, 
    private weatherService: WeatherService,
    private favouriteService: FavouriteService
  ) {}
  
  favouriteCities: any[] = [];

  ngOnInit() {
    this.loadFavouriteCities();
  }

  loadFavouriteCities(): void {
    const cities = this.favouriteService.getFavourites();
    const weatherObservables = cities.map(city =>
      this.weatherService.getWeatherDataFavourite(city.lat, city.lon, city.timezone)
        .pipe(
          map(response => {
            const processedWeather = this.processFavouriteData(response, city.timezone);
            const currentDate = moment().tz(city.timezone); 
            const formattedDate = currentDate.format('D MMM');
            return { 
              ...city,
              name: city.cityName, 
              weather: processedWeather,
              formattedDate 
            };
          })
        )
    );

    forkJoin(weatherObservables).subscribe(results => {
      this.favouriteCities = results;
      this.checkScrollButtons(); // Update scroll buttons after loading cities
    });
  }

  updateFavouriteCities(cityName: string): void {
    // Remove the city from the local array
    this.favouriteCities = this.favouriteCities.filter(city => city.cityName !== cityName);
    this.checkScrollButtons(); // Update the scroll buttons after removing a city
  }

  
  processFavouriteData(response: any, timezone: string): any[] {
    try {
      console.log("response hour: ", response);

      const hourlyForecast: any[] = []; // Переменная для хранения почасового прогноза
      // Извлекаем данные из ответа
      const temperatureData = response.data.find((d: any) => d.parameter === 't_2m:C')?.coordinates[0]?.dates || [];
      const windSpeedData = response.data.find((d: any) => d.parameter === 'wind_speed_FL10:ms')?.coordinates[0]?.dates || [];
      const windDirData = response.data.find((d: any) => d.parameter === 'wind_dir_10m:d')?.coordinates[0]?.dates || [];
      const weatherIconData = response.data.find((d: any) => d.parameter === 'weather_symbol_20min:idx')?.coordinates[0]?.dates || [];
      const relativeHumidity = response.data.find((d: any) => d.parameter === 'relative_humidity_2m:p')?.coordinates[0]?.dates || [];

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
      relativeHumidity.forEach((entry: any) => {
        const data = weatherMap.get(entry.date) || {};
        data.relativeHumidity = entry.value;
        weatherMap.set(entry.date, data);
      });

      console.log("weatherMap: ", weatherMap);

  
      // Преобразуем данные в нужный формат
      

      Array.from(weatherMap.entries()).forEach(([date, data]) => {
        const time = moment(date).tz(timezone); 
        const formattedTime = time.format('HH:mm');
        const windSpeed = data.windSpeed || 0;
        const windDir = data.windDir || 0;
        const weatherIconIndex = data.weatherIconIndex || 0;
        const relativeHumidity = data.relativeHumidity || 0;

        hourlyForecast.push({
          time: formattedTime,
          temperature: `${data.temperature || 'N/A'}`,
          windSpeed: `${windSpeed}`,
          relativeHumidity: `${relativeHumidity}`,
          windIcon: this.getWindDirectionIcon(windDir),
          weatherIcon: this.getWeatherInfo(weatherIconIndex).icon,
        });
      });

      return hourlyForecast; // Возвращаем обработанные данные
    } catch (error) {
      console.error('Error in processHourlyData:', error);
      return []; // Возвращаем пустой массив в случае ошибки
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


  
  ngAfterViewInit() {
    // Устанавливаем фокус на контейнер
    this.elRef.nativeElement.querySelector('.main-content').focus();
    this.checkScrollButtons();
  }

  checkScrollButtons() {
    const mainContent = this.elRef.nativeElement.querySelector('.main-content');
    const cards = mainContent.querySelectorAll('app-favouritecard');
    this.showScrollButtons = cards.length > 2; // Показывать кнопки, если карточек больше 2
  }

  scrollUp() {
    const mainContent = this.elRef.nativeElement.querySelector('.main-content');
    const cardHeight = mainContent.querySelector('app-favouritecard')?.offsetHeight || 0;
    const scrollDistance = cardHeight + 40; // Смещение на 40 пикселей больше
    mainContent.scrollBy({ top: -scrollDistance, behavior: 'smooth' }); // Скролл вверх на одну карточку
  }

  scrollDown() {
    const mainContent = this.elRef.nativeElement.querySelector('.main-content');
    const cardHeight = mainContent.querySelector('app-favouritecard')?.offsetHeight || 0;
    const scrollDistance = cardHeight + 40; // Смещение на 40 пикселей больше
    mainContent.scrollBy({ top: scrollDistance, behavior: 'smooth' }); // Скролл вниз на одну карточку
  }

  // @HostListener('window:keydown', ['$event'])
  // handleKeyDown(event: KeyboardEvent) {
  //   const mainContent = this.elRef.nativeElement.querySelector('.main-content');
  //   const cardHeight = mainContent.querySelector('app-favouritecard')?.offsetHeight || 0;
  //   const scrollDistance = cardHeight + 40; // Смещение на 40 пикселей больше

  //   console.log('cardHeight: ', cardHeight);
  //   console.log('scrollDistance: ', scrollDistance);

  //   if (event.key === 'ArrowDown') {
  //     // Scroll down by the height of one card
  //     mainContent.scrollBy({ top: scrollDistance, behavior: 'smooth' });
  //     event.preventDefault();
  //   } else if (event.key === 'ArrowUp') {
  //     // Scroll up by the height of one card
  //     mainContent.scrollBy({ top: -scrollDistance, behavior: 'smooth' });
  //     event.preventDefault();
  //   }
  // }


  onCitySearch(data: { city: string, lat: number, lon: number, timezone: string }) {
    this.cityName = data.city;
    this.lat = data.lat;
    this.lon = data.lon;
    this.timezone = data.timezone;


    console.log('fv cityName', this.cityName);
    console.log('fv lat', this.lat);
    console.log('fv lon', this.lon);
    console.log('fv timezone', this.timezone);

    // Переход на компонент home с параметром city
    this.router.navigate(['/home'], { queryParams: { cityName: this.cityName, lat: this.lat, lon: this.lon, timezone: this.timezone, } });
  }
}
