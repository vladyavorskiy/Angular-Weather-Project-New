import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { format, toZonedTime } from 'date-fns-tz';
import { FavouriteService } from '../favourite.service';

@Component({
  selector: 'app-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.css']
})
export class AdditionalComponent implements OnInit, OnDestroy {
  
  additional_info = {
    currentDay: 'None',
    currentDate: 'None',
    currentTime:  '00:00'
  };

  @Input() lat: number | null  = null ;
  @Input() lon: number | null  = null ;
  @Input() cityName: string = 'Unknown';  
  @Input() timezone: string = ''; // Add input property for timezone

  private intervalId: any;
  isFavourite: boolean = false; // Flag to check if the city is already a favorite

  ngOnInit(): void {
    this.startRealTimeClock(); // Start the real-time clock when the component initializes
    this.checkIfFavourite(); // Check if the city is already in favorites
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Clear the interval when the component is destroyed
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cityName'] || changes['lat'] || changes['lon']) {
      this.checkIfFavourite(); // Проверка избранного при изменении входных данных
    }
  }

  constructor(
    private favouriteService: FavouriteService,
  ) {}

  checkIfFavourite() {
    if (this.lat !== null && this.lon !== null) {
    this.isFavourite = this.favouriteService.isFavourite(this.cityName, this.lat, this.lon);
    }
    console.log('isFavourite: ', this.isFavourite);
  }

  toggleFavourite() {
    if (this.isFavourite) {
      this.removeFromFavourites();
    } else {
      this.addToFavourites();
    }
  }

  removeFromFavourites() {
    this.favouriteService.removeFavourite(this.cityName);
    this.isFavourite = false; // Update the flag after removing
  }

  addToFavourites() {
    // Проверяем, что lat и lon не равны null
    if (this.lat !== null && this.lon !== null) {
      const city = {
        cityName: this.cityName,
        lat: this.lat,
        lon: this.lon,
        timezone: this.timezone
      };
      this.favouriteService.addFavourite(city);
      this.isFavourite = true;
      // Дополнительная логика, например, отображение уведомления
    } else {
      console.warn('Coordinates are not available.');
    }
  }

  startRealTimeClock(): void {
    this.updateDateTime();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => this.updateDateTime(), 1000); // Update every second
  }

  updateDateTime(): void {
    const localTimeData = this.getLocalTimeInCity(this.timezone);
    this.additional_info.currentTime = localTimeData.time;
    this.additional_info.currentDay = localTimeData.dayOfWeek;
    this.additional_info.currentDate = localTimeData.date;
  }

  public getLocalTimeInCity(timezone: string): { time: string; date: string; dayOfWeek: string } {
    const utcNow = new Date();
    const zonedTime = toZonedTime(utcNow, timezone);
    const timeFormat = 'HH:mm:ss';
    const dateFormat = 'yyyy-MM-dd';
    const dayOfWeekFormat = 'EEEE';

    const time = format(zonedTime, timeFormat, { timeZone: timezone });
    const date = format(zonedTime, dateFormat, { timeZone: timezone });
    const dayOfWeek = format(zonedTime, dayOfWeekFormat, { timeZone: timezone });

    return {
      time,
      date,
      dayOfWeek
    };
  }
}
