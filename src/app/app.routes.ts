import { Routes } from '@angular/router';
import { InvestingCalculatorComponent } from './investing-calculator/investing-calculator.component';
import { HomepageComponent } from './homepage/homepage.component';
import { CalendarComponent } from './calendar/calendar.component';
import { VidsrcMoviesShowsComponent } from './vidsrc-movies-shows/vidsrc-movies-shows.component';

export const routes: Routes = [
    {path: '', component: HomepageComponent},
    {path: 'app-investing-calculator', component: InvestingCalculatorComponent},
    {path: 'app-calendar', component: CalendarComponent},
    {path: 'vidsrc-movies-shows', component: VidsrcMoviesShowsComponent}
];

