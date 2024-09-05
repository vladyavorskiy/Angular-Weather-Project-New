import { Component } from '@angular/core';

@Component({
  selector: 'app-favouritecard',
  templateUrl: './favouritecard.component.html',
  styleUrls: ['./favouritecard.component.css']
})
export class FavouritecardComponent {
  // Массив с температурами
  temperatures: number[] = [70, 60, 0,50, -50,24, 18, -5, 10, -12, 15, 3, -8, 20, 50];
  humidities: number[] = [0,50, 50,24, 18, 5, 10, 12, 15, 3, 8, 20, 50];
  windSpeeds: number[] = [0,10, 2,4, 0, 5, 10, 12, 15, 3, 25, 7, 20];
  // Метод для вычисления цвета карточки в зависимости от температуры
  getTemperatureColor(temperature: number): string {
    // return temperature > 0 ? 'yellow' : 'lightblue';
    if (temperature > 0) {
      // Положительная температура: теплый градиент
      return `linear-gradient(to bottom, rgba(255, 200, 0, 0.8), rgba(254, 251, 65, 0.1))`;
    } else {
      // Отрицательная температура: холодный градиент
      return `linear-gradient(to bottom, rgba(28, 180, 237, 0.8), rgba(104, 207, 192, 0.1))`;
    }
  }

  getCoverHeight(humidity: number): string {
    return `calc(${humidity}% + 0px)`; // Высота, которая перекрывает заполненную иконку
  }

  // Метод для вычисления высоты карточки в зависимости от модуля температуры
  getDynamicHeight(temperature: number): number {
    const baseHeight = 60; // Базовая высота карточки
    return baseHeight + Math.abs(temperature) * 2; // Увеличиваем высоту на 2 пикселя за каждый градус
  }


  getWindHeight(windSpeed: number): number {
    const baseHeight = 0; // Базовая высота прямоугольника
    return baseHeight + Math.abs(windSpeed) * 1.5; // Увеличиваем высоту на 2 пикселя за каждую единицу скорости
  }
}

// maxTemperature: number = 100;

// // Массив прогнозов погоды с температурой и временем
// weatherForecast = [
//   { temperature: 29, time: '13:00' },
//   { temperature: -5, time: '14:00' },
//   { temperature: 70, time: '15:00' },
//   { temperature: -20, time: '16:00' }
//   // Добавьте больше объектов прогноза по мере необходимости
// ];

// // Метод для расчета высоты столбца температуры
// getTemperatureHeight(temp: number): string {
//   const absoluteTemp = Math.abs(temp);
//   const heightPercentage = Math.min((absoluteTemp / this.maxTemperature) * 100, 100); // Ограничение до 100%
//   console.log(`Temperature: ${temp}, Height: ${heightPercentage}%`); // Debug output
//   return `${heightPercentage}%`;
// }