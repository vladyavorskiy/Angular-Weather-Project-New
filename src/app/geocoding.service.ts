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



  public getCoordinates(cityName: string): Observable<{ lat: number; lon: number }> {
    const url = `${this.geocodingApiUrl}?text=${cityName}&apiKey=${this.apiKey}`;
    console.log('URL Geo:', url); 
    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response && response.features && response.features.length > 0) {
          const coordinates = response.features[0].geometry.coordinates;
          console.log('coordinates:', coordinates); 

          return { lon: coordinates[0], lat: coordinates[1] };
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
    const url = `${this.timezoneApiUrl}?lat=${lat}&lon=${lon}&apiKey=${this.apiKey}`;
    console.log('URL TZ:', url); 
    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response && response.features) {
          return response.features[0].properties.timezone.name; // Возвращаем название часового пояса
        }
        throw new Error('Timezone not found');
      })
    );


    const mockTimezone = 'Europe/Amsterdam'; 
    return of(mockTimezone);
  }

  
}



