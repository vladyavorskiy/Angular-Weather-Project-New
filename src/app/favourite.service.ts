import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavouriteService {
  private storageKey = 'favouriteCities';

  getFavourites(): { cityName: string; lat: number; lon: number, timezone: string}[] {
    const favourites = localStorage.getItem(this.storageKey);
    return favourites ? JSON.parse(favourites) : [];
  }

  // addFavourite(city: { cityName: string; lat: number; lon: number, timezone: string }): void {
  //   const favourites = this.getFavourites();
  //   favourites.push(city);
  //   localStorage.setItem(this.storageKey, JSON.stringify(favourites));
  // }

  // removeFavourite(cityName: string): void {
  //   const favourites = this.getFavourites();
  //   const updatedFavourites = favourites.filter(fav => fav.cityName !== cityName);
  //   localStorage.setItem(this.storageKey, JSON.stringify(updatedFavourites));
  // }


  addFavourite(city: { cityName: string; lat: number; lon: number, timezone: string }): void {
    const favourites = this.getFavourites();
    // Проверка на наличие города в избранном
    if (!favourites.some(fav => fav.cityName === city.cityName && fav.lat === city.lat && fav.lon === city.lon)) {
      favourites.push(city);
      localStorage.setItem(this.storageKey, JSON.stringify(favourites));
    }
  }


  removeFavourite(cityName: string): void {
      const favourites = this.getFavourites();
      const updatedFavourites = favourites.filter(fav => fav.cityName !== cityName);
      localStorage.setItem(this.storageKey, JSON.stringify(updatedFavourites));
    }

  isFavourite(cityName: string, lat: number, lon: number): boolean {
    const favourites = this.getFavourites();
    return favourites.some(fav => fav.cityName === cityName && fav.lat === lat && fav.lon === lon);
  }
}


