import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, interval, map, Subscription } from 'rxjs';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnDestroy {

  dateObservable$: Observable<Date>;
  subscription: Subscription;

  currentDate = new Date();
  christmasDate = new Date(this.currentDate.getFullYear(), 11, 25);
  isTodayChristmas = (this.currentDate.getMonth() === this.christmasDate.getMonth() && this.currentDate.getDay() === this.christmasDate.getDay());
  daysTillChristmas = this.getDaysTillChristmas(this.currentDate, this.christmasDate);



  constructor(){
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
      return daysTillChristmas;
    }
    else {
      const nextYearsChristmasDate = new Date(christmasDate.getFullYear() + 1, christmasDate.getMonth(), christmasDate.getDate());
      const daysTillChristmas = (nextYearsChristmasDate.getTime() - simpleTodayDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysTillChristmas
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
