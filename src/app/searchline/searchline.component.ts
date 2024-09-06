import { Component, Output, EventEmitter } from '@angular/core';
import { GeocodingService } from '../geocoding.service'; // Путь может отличаться

@Component({
  selector: 'app-searchline',
  templateUrl: './searchline.component.html',
  styleUrls: ['./searchline.component.css']
})
export class SearchlineComponent {
  cityName: string = '';
  cityNameChoice: string = '';
  // @Output() citySearched = new EventEmitter<string>();
  // @Output() coordinatesFound = new EventEmitter<{ lat: number, lon: number, timezone: string }>();

  @Output() citySearched = new EventEmitter<{ 
    city: string, 
    lat: number, 
    lon: number, 
    timezone: string 
  }>();

  constructor(private geocodingService: GeocodingService) {}


  search() {
    const cityToSearch = this.cityName;
    this.cityName = ''; // Очистка поля поиска
    this.geocodingService.getCoordinates(cityToSearch).subscribe(coords => {
      this.geocodingService.getTimezone(coords.lat, coords.lon).subscribe(timezone => {
        console.log('sl cityName', cityToSearch);
        console.log('sl lat', coords.lat);
        console.log('sl lon', coords.lon);
        console.log('sl timezone', timezone);

        // Эмитируем объект, содержащий город, координаты и временную зону
        this.citySearched.emit({
          city: cityToSearch,
          lat: coords.lat,
          lon: coords.lon,
          timezone: timezone
        });
      });
    });
  }


  useCurrentLocation() {
    this.geocodingService.getCurrentLocation().subscribe(location => {
      this.geocodingService.getTimezone(location.lat, location.lon).subscribe(timezone => {
        console.log('Current Location cityName', location.cityName);
        console.log('Current Location lat', location.lat);
        console.log('Current Location lon', location.lon);
        console.log('Current Location timezone', timezone);

        // Эмитируем объект, содержащий город, координаты и временную зону
        this.citySearched.emit({
          city: location.cityName,
          lat: location.lat,
          lon: location.lon,
          timezone: timezone
        });
      });
    });
  }
}
