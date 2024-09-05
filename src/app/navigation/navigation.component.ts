import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  activeIconMap: { [key: string]: string } = {
    '/home': '/assets/png/home_blue.png',
    '/favorite': '/assets/png/cities_blue.png'
  };
  
  inactiveIconMap: { [key: string]: string } = {
    '/home': '/assets/png/home_white.png',
    '/favorite': '/assets/png/cities_white.png'
  };

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  getIcon(route: string): string {
    //return this.isActive(route) ? this.activeIconMap[route] : this.inactiveIconMap[route];
    //return this.router.url === route ? this.activeIconMap[route] : this.inactiveIconMap[route];
    return this.router.url.split('?')[0] === route ? this.activeIconMap[route] : this.inactiveIconMap[route];

  }
}
