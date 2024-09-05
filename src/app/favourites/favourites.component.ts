import { Component, HostListener, ElementRef, AfterViewInit  } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.css']
})
export class FavouritesComponent implements AfterViewInit{

  cityName: string = '';
  lat: number | null = null;
  lon: number | null = null;
  timezone: string = '';
  showScrollButtons: boolean = false; // Флаг для отображения кнопок

  constructor(private router: Router, private elRef: ElementRef) {}
  
  
  
  ngAfterViewInit() {
    // Устанавливаем фокус на контейнер
    this.elRef.nativeElement.querySelector('.main-content').focus();
    this.checkScrollButtons();
  }

  checkScrollButtons() {
    const mainContent = this.elRef.nativeElement.querySelector('.main-content');
    const cards = mainContent.querySelectorAll('app-favouritecard');
    this.showScrollButtons = cards.length > 2; // Показывать кнопки, если карточек больше 2
  }

  scrollUp() {
    const mainContent = this.elRef.nativeElement.querySelector('.main-content');
    const cardHeight = mainContent.querySelector('app-favouritecard')?.offsetHeight || 0;
    const scrollDistance = cardHeight + 40; // Смещение на 40 пикселей больше
    mainContent.scrollBy({ top: -scrollDistance, behavior: 'smooth' }); // Скролл вверх на одну карточку
  }

  scrollDown() {
    const mainContent = this.elRef.nativeElement.querySelector('.main-content');
    const cardHeight = mainContent.querySelector('app-favouritecard')?.offsetHeight || 0;
    const scrollDistance = cardHeight + 40; // Смещение на 40 пикселей больше
    mainContent.scrollBy({ top: scrollDistance, behavior: 'smooth' }); // Скролл вниз на одну карточку
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const mainContent = this.elRef.nativeElement.querySelector('.main-content');
    const cardHeight = mainContent.querySelector('app-favouritecard')?.offsetHeight || 0;
    const scrollDistance = cardHeight + 40; // Смещение на 40 пикселей больше

    console.log('cardHeight: ', cardHeight);
    console.log('scrollDistance: ', scrollDistance);

    if (event.key === 'ArrowDown') {
      // Scroll down by the height of one card
      mainContent.scrollBy({ top: scrollDistance, behavior: 'smooth' });
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      // Scroll up by the height of one card
      mainContent.scrollBy({ top: -scrollDistance, behavior: 'smooth' });
      event.preventDefault();
    }
  }


  onCitySearch(data: { city: string, lat: number, lon: number, timezone: string }) {
    this.cityName = data.city;
    this.lat = data.lat;
    this.lon = data.lon;
    this.timezone = data.timezone;


    console.log('fv cityName', this.cityName);
    console.log('fv lat', this.lat);
    console.log('fv lon', this.lon);
    console.log('fv timezone', this.timezone);

    // Переход на компонент home с параметром city
    this.router.navigate(['/home'], { queryParams: { cityName: this.cityName, lat: this.lat, lon: this.lon, timezone: this.timezone, } });
  }
}
