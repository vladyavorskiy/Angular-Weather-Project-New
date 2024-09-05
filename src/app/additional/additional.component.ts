import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { format, toZonedTime } from 'date-fns-tz';

@Component({
  selector: 'app-additional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.css']
})
export class AdditionalComponent implements OnInit, OnDestroy {
  
  additional_info = {
    currentDay: 'None',
    currentDate: 'None',
    currentTime:  '00:00'
  };

  
  @Input() cityName: string = 'Unknown';  
  @Input() timezone: string = ''; // Add input property for timezone

  private intervalId: any;

  ngOnInit(): void {
    this.startRealTimeClock(); // Start the real-time clock when the component initializes
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Clear the interval when the component is destroyed
    }
  }

  startRealTimeClock(): void {
    this.updateDateTime();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => this.updateDateTime(), 1000); // Update every second
  }

  updateDateTime(): void {
    const localTimeData = this.getLocalTimeInCity(this.timezone);
    this.additional_info.currentTime = localTimeData.time;
    this.additional_info.currentDay = localTimeData.dayOfWeek;
    this.additional_info.currentDate = localTimeData.date;
  }

  public getLocalTimeInCity(timezone: string): { time: string; date: string; dayOfWeek: string } {
    const utcNow = new Date();
    const zonedTime = toZonedTime(utcNow, timezone);
    const timeFormat = 'HH:mm:ss';
    const dateFormat = 'yyyy-MM-dd';
    const dayOfWeekFormat = 'EEEE';

    const time = format(zonedTime, timeFormat, { timeZone: timezone });
    const date = format(zonedTime, dateFormat, { timeZone: timezone });
    const dayOfWeek = format(zonedTime, dayOfWeekFormat, { timeZone: timezone });

    return {
      time,
      date,
      dayOfWeek
    };
  }
}
