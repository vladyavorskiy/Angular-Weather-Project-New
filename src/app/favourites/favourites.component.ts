import { Component, HostListener, ElementRef, AfterViewInit, OnInit, ViewChildren, ViewChild, QueryList, ChangeDetectorRef   } from '@angular/core';
import { Router } from '@angular/router';
import { WeatherService } from '../weather.service';
import { Observable, forkJoin } from 'rxjs';
import { FavouriteService } from '../favourite.service';
import { map } from 'rxjs/operators';
import * as moment from 'moment-timezone';
import { IconsService } from '../icons.service';


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
    private favouriteService: FavouriteService,
    private iconsService: IconsService,

  ) {}
  
  favouriteCities: any[] = [];

  ngOnInit() {
    this.loadFavouriteCities();
  }

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


  updateFavouriteCities(cityName: string): void {
    // Remove the city from the local array
    this.favouriteCities = this.favouriteCities.filter(city => city.cityName !== cityName);
    this.checkScrollButtons(); // Update the scroll buttons after removing a city
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
          windIcon: this.iconsService.getWindDirectionIcon(windDir),
          weatherIcon: this.iconsService.getWeatherInfo(weatherIconIndex).icon,
        });
      });

      return hourlyForecast; // Возвращаем обработанные данные
    } catch (error) {
      console.error('Error in processHourlyData:', error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  }


  @ViewChild('mainContent') mainContent!: ElementRef;
  @ViewChildren('card') cards!: QueryList<ElementRef>;
  
  ngAfterViewInit() {
    this.checkScrollButtons();
    this.cards.changes.subscribe(() => this.checkScrollButtons());
  }


  // ngAfterViewInit() {
  //   this.cdr.detectChanges();
  //   this.checkScrollButtons();
  //   this.cards.changes.subscribe(() => {
  //     this.cdr.detectChanges();
  //     this.checkScrollButtons();
  //   });
  // }


  
  scrollUp() {
    const mainContent = this.elRef.nativeElement.querySelector('.main-content');
    const cardHeight = mainContent.querySelector('app-favouritecard')?.offsetHeight || 0;
    const scrollDistance = cardHeight + 30; // Смещение на 40 пикселей больше
    mainContent.scrollBy({ top: -scrollDistance, behavior: 'smooth' });
  }

  scrollDown() {
    const mainContent = this.elRef.nativeElement.querySelector('.main-content');
    const cardHeight = mainContent.querySelector('app-favouritecard')?.offsetHeight || 0;
    const scrollDistance = cardHeight + 30; // Смещение на 40 пикселей больше
    mainContent.scrollBy({ top: scrollDistance, behavior: 'smooth' });

  }


  checkScrollButtons() {
    if (this.cards.length > 2) {
      this.showScrollButtons = true;
    } else {
      this.showScrollButtons = false;
    }
  }

  
  
}


