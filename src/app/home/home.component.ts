import { Component, OnInit, OnDestroy  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  cityName: string = '';
  lat: number | null = null;
  lon: number | null = null;
  timezone: string = '';
  
  constructor(private route: ActivatedRoute) {}

 
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Получаем все параметры из URL
      this.cityName = params['cityName'] || '';
      this.lat = params['lat'] ? parseFloat(params['lat']) : null; // Преобразуем строку в число
      this.lon = params['lon'] ? parseFloat(params['lon']) : null; // Преобразуем строку в число
      this.timezone = params['timezone'] || '';
      
      console.log(`City: ${this.cityName}, Lat: ${this.lat}, Lon: ${this.lon}, Timezone: ${this.timezone}`);

      console.log('cityName', this.cityName);
      console.log('lat', this.lat);
      console.log('lon', this.lon);
      console.log('timezone', this.timezone);
    });
  }


  onCitySearch(data: { city: string, lat: number, lon: number, timezone: string }) {
    this.cityName = data.city;
    this.lat = data.lat;
    this.lon = data.lon;
    this.timezone = data.timezone;
  }


}
