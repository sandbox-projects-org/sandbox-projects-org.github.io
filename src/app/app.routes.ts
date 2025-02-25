import { Routes } from "@angular/router";
import { InvestingCalculatorComponent } from "./app-pages/investing-calculator/investing-calculator.component";
import { HomepageComponent } from "./homepage/homepage.component";
import { CalendarComponent } from "./app-pages/calendar/calendar.component";
import { MoviesShowsComponent } from "./app-pages/movies-shows/movies-shows.component";
import { PageNotFoundComponent } from "./shared/components/page-not-found/page-not-found.component";
import { VideoPlayerComponent } from "./app-pages/movies-shows/video-player/video-player.component";

export const routes: Routes = [
	{ path: "", component: HomepageComponent },
	{ path: "app-investing-calculator", component: InvestingCalculatorComponent },
	{ path: "app-calendar", component: CalendarComponent },
	{
		path: "app-movies-shows",
		component: MoviesShowsComponent,
		children: [{ path: "app-video-player", component: VideoPlayerComponent }],
	},
	{ path: "**", component: PageNotFoundComponent },
];
