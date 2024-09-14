import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WeatherService } from '../weather.service';
import * as moment from 'moment-timezone';
import { IconsService } from '../icons.service';

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

  constructor(private weatherService: WeatherService, private iconsService: IconsService) {}

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

    const weatherInfo = this.iconsService.getWeatherInfo(this.weatherData.symbol);
    this.weatherData.icon = weatherInfo.icon;
    this.weatherData.description = weatherInfo.description;

    }


  public formatUTCToTimeInZone(utcDateString: string, timezone: string): string {
    // Преобразуем строку даты в объект moment с временной зоной UTC
    const utcMoment = moment.utc(utcDateString);

    // Преобразуем момент в заданный часовой пояс и форматируем в "HH:mm"
    const time = utcMoment.tz(timezone).format('HH:mm');

    return time;
}
}
