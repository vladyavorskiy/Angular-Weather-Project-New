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

  // search() {
  //   //this.citySearched.emit(this.cityName); // Эмитируем название города
  //   this.cityNameChoice = this.cityName;
  //   this.cityName = '';
  //   // Получаем координаты города
  //   this.geocodingService.getCoordinates(this.cityNameChoice).subscribe(coords => {
  //     // Получаем временную зону по координатам
  //     this.geocodingService.getTimezone(coords.lat, coords.lon).subscribe(timezone => {
  //       // Эмитируем найденные координаты и временную зону
  //       this.citySearched.emit({
  //         lat: coords.lat,
  //         lon: coords.lon,
  //         timezone: timezone,
  //         cityName: cityName
  //       });
        
  //     });
  //   });
  // }

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
}
