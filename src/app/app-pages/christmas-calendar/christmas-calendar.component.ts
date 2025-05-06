import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, interval, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-christmas-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './christmas-calendar.component.html',
  styleUrl: './christmas-calendar.component.scss'
})
export class ChristmasCalendarComponent implements OnDestroy {
snowflakes= new Array(50);

  dateObservable$: Observable<Date>;
  subscription: Subscription;

  currentDate = new Date();
  christmasDate = new Date(this.currentDate.getFullYear(), 11, 25);
  isTodayChristmas = (this.currentDate.getMonth() === this.christmasDate.getMonth() && this.currentDate.getDay() === this.christmasDate.getDay());
  daysTillChristmas = this.getDaysTillChristmas(this.currentDate, this.christmasDate);



  constructor(){
    document.body.style.backgroundColor = '#005670';

    // initialize observable to emit datetime every second
    this.dateObservable$ = interval(1000).pipe(
      map(() => new Date())
    )

    // initialize subscription to observable
    this.subscription = this.dateObservable$.subscribe(x => {
      this.currentDate = x
      this.isTodayChristmas = (this.currentDate.getMonth() === this.christmasDate.getMonth() && this.currentDate.getDay() === this.christmasDate.getDay());
      this.daysTillChristmas = this.getDaysTillChristmas(this.currentDate, this.christmasDate);
    })
  }

  getDaysTillChristmas(todayDate: Date, christmasDate: Date): number {
    const simpleTodayDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    if (this.isTodayChristmas) {
      return 0;
    }
    else if (todayDate.getTime() < christmasDate.getTime()) {
      const daysTillChristmas = (christmasDate.getTime() - simpleTodayDate.getTime()) / (1000 * 60 * 60 * 24);
      return Math.round(daysTillChristmas);
    }
    else {
      const nextYearsChristmasDate = new Date(christmasDate.getFullYear() + 1, christmasDate.getMonth(), christmasDate.getDate());
      const daysTillChristmas = (nextYearsChristmasDate.getTime() - simpleTodayDate.getTime()) / (1000 * 60 * 60 * 24);
      return Math.round(daysTillChristmas)
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    document.body.style.backgroundColor = '#eefeff';
  }
}
