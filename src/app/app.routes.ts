import { Routes } from '@angular/router';
import { InvestingCalculatorComponent } from './app-pages/investing-calculator/investing-calculator.component';
import { HomepageComponent } from './homepage/homepage.component';
import { CalendarComponent } from './app-pages/calendar/calendar.component';
import { MoviesShowsComponent } from './app-pages/movies-shows/movies-shows.component';

export const routes: Routes = [
    {path: '', component: HomepageComponent},
    {path: 'app-investing-calculator', component: InvestingCalculatorComponent},
    {path: 'app-calendar', component: CalendarComponent},
    {path: 'app-movies-shows', component: MoviesShowsComponent},
];

