import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // Добавить для работы с HTTP-запросами
import { FormsModule } from '@angular/forms'; // Для работы с формами
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GeoapifyGeocoderAutocompleteModule } from '@geoapify/angular-geocoder-autocomplete';
import { FavouritesComponent } from './favourites/favourites.component';
import { NavigationComponent } from './navigation/navigation.component';
import { SearchlineComponent } from './searchline/searchline.component';
import { AdditionalComponent } from './additional/additional.component';
import { CurrentWeatherComponent } from './currentweather/currentweather.component';
import { HourlyforecastComponent } from './hourlyforecast/hourlyforecast.component';
import { DailyforecastComponent } from './dailyforecast/dailyforecast.component';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { FavouritecardComponent } from './favouritecard/favouritecard.component'; // Добавьте этот импорт

@NgModule({
  declarations: [
    AppComponent,
    FavouritesComponent,
    NavigationComponent,
    SearchlineComponent,
    AdditionalComponent,
    CurrentWeatherComponent,
    HourlyforecastComponent,
    DailyforecastComponent,
    HomeComponent,
    FavouritecardComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule, // Обязательно для работы с HTTP-запросами
    FormsModule, // Для работы с ngModel и другими формами
    GeoapifyGeocoderAutocompleteModule.withConfig('e53f3968cd2640a7aa15e34845e7677e')  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
