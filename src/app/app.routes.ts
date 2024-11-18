import { Routes } from '@angular/router';
import { StocksComponent } from './stocks/stocks.component';
import { HomepageComponent } from './homepage/homepage.component';

export const routes: Routes = [
    {path: '', component: HomepageComponent},
    {path: 'app-stocks', component: StocksComponent},
];

