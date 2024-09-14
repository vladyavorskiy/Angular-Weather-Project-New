import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private geocodingApiUrl = 'https://api.geoapify.com/v1/geocode/search';
  private timezoneApiUrl = 'https://api.geoapify.com/v1/geocode/reverse';
  private IPApiUrl = 'https://api.geoapify.com/v1/ipinfo'
  private apiKey = 'e53f3968cd2640a7aa15e34845e7677e'; 

  constructor(private http: HttpClient) {}
 
  public getCurrentLocation(): Observable<{ cityName: string; lat: number; lon: number }> {
    const url = `${this.IPApiUrl}?apiKey=${this.apiKey}`;
    console.log('URL IP :', url); 
    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response && response.city && response.location) {
          const cityName = response.city.name;
          const lat = response.location.latitude;
          const lon = response.location.longitude;
          console.log('cityName :', cityName);
          console.log('lat :', lat); 
          console.log('lon :', lon);  
          return { cityName, lat, lon };
        }
        throw new Error('Location not found');
      })
    );

    const mockResponse = {
      cityName: 'Amsterdam',
      lat: 52.3824,
      lon: 4.8995
    };
  
    return of(mockResponse);

  }



  // Сохранение в localStorage
  private cacheData(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Получение данных из localStorage
  private getCachedData(key: string): any {
    const cachedData = localStorage.getItem(key);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  public getCoordinates(cityName: string): Observable<{ lat: number; lon: number }> {
    
    const cacheKey = `coordinates_${cityName.toLowerCase()}`;
    const cachedData = this.getCachedData(cacheKey);

    if (cachedData) {
      console.log('Использование кэшированных координат:', cachedData);
      return of(cachedData);
    }
    
    const url = `${this.geocodingApiUrl}?text=${cityName}&apiKey=${this.apiKey}`;
    console.log('URL Geo:', url); 
    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response && response.features && response.features.length > 0) {
          const coordinates = response.features[0].geometry.coordinates;
          const result = { lon: coordinates[0], lat: coordinates[1] };
          this.cacheData(cacheKey, result); // Сохранение в кэш
          console.log('coordinates:', result);
          return result;
        }
        throw new Error('City not found');
      })
    );

    const mockCoordinates = {
      lat: 52.3824,  // Replace with mock latitude
      lon: 4.8995    // Replace with mock longitude
    };
  
  
    return of(mockCoordinates);

  }

  public getTimezone(lat: number, lon: number): Observable<string> {
    
    const cacheKey = `timezone_${lat}_${lon}`;
    const cachedData = this.getCachedData(cacheKey);

    if (cachedData) {
      console.log('Использование кэшированной временной зоны:', cachedData);
      return of(cachedData);
    }
    
    const url = `${this.timezoneApiUrl}?lat=${lat}&lon=${lon}&apiKey=${this.apiKey}`;
    console.log('URL TZ:', url); 
    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response && response.features) {
          const timezone = response.features[0].properties.timezone.name;
          this.cacheData(cacheKey, timezone); // Сохранение в кэш
          console.log('timezone:', timezone);
          return timezone;
        }
        throw new Error('Timezone not found');
      })
    );


    const mockTimezone = 'Europe/Amsterdam'; 
    return of(mockTimezone);
  }

  
}



