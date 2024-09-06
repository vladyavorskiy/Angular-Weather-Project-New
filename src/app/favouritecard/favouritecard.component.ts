import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FavouriteService } from '../favourite.service';

@Component({
  selector: 'app-favouritecard',
  templateUrl: './favouritecard.component.html',
  styleUrls: ['./favouritecard.component.css']
})
export class FavouritecardComponent {


  @Input() city: any; 
  @Output() cityRemoved = new EventEmitter<string>(); // Event to notify parent about removal

  constructor(
    private favouriteService: FavouriteService
  ) {}

  removeCity(city: { cityName: string; lat: number; lon: number; timezone: string }): void {
    this.favouriteService.removeFavourite(city.cityName);
    this.cityRemoved.emit(city.cityName); // Emit event to parent to update the list
  }
  
  getTemperatureColor(temperature: number): string {
    if (temperature > 0) {
      return `linear-gradient(to bottom, rgba(255, 200, 0, 0.8), rgba(254, 251, 65, 0.1))`;
    } else {
      return `linear-gradient(to bottom, rgba(28, 180, 237, 0.8), rgba(104, 207, 192, 0.1))`;
    }
  }

  getCoverHeight(humidity: number): string {
    return `calc(${humidity}% + 0px)`; 
  }

  getDynamicHeight(temperature: number): number {
    const baseHeight = 60; 
    return baseHeight + Math.abs(temperature) * 2; 
  }


  getWindHeight(windSpeed: number): number {
    const baseHeight = 0; 
    return baseHeight + Math.abs(windSpeed) * 1.5; 
  }
}

