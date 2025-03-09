import { Component } from "@angular/core";
import { AngularMaterialModule } from "../../shared/modules/angular-material.module";
import { TmdbService } from "./services/tmdb.service";
import { IMediaInfo, ISearchResults } from "./interfaces";
import { EMediaType } from "./constants";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { MoviesShowsService } from "./movies-shows.service";

@Component({
	selector: "app-movies-shows",
	standalone: true,
	imports: [AngularMaterialModule, RouterOutlet],
	templateUrl: "./movies-shows.component.html",
	styleUrl: "./movies-shows.component.scss",
})
export class MoviesShowsComponent {
	showResults = false;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		public moviesShowsService: MoviesShowsService
	) {
		if (localStorage.getItem("searchState") && location.pathname === '/app-movies-shows') {
			this.showResults = true;
			const localStorageSearchState = JSON.parse(localStorage.getItem("searchState")!)

			moviesShowsService.updateSearchState(
				localStorageSearchState
			);
			history.replaceState({searchState: localStorageSearchState}, '', `${window.location.origin}/app-movies-shows`)
		}
		window.addEventListener("popstate", (event) => {
			if (location.pathname === "/app-movies-shows") {
				this.showResults = true;
				moviesShowsService.updateSearchState(
					history.state.searchState
				);
			}
			if (location.pathname === "/app-movies-shows/app-video-player") {
				this.showResults = false;
			}
			console.log(moviesShowsService.subscriptionList)
		});
		window.addEventListener("scroll", (event) => {
			if (location.pathname === "/app-movies-shows") {
				if (
					window.scrollY + window.innerHeight >
						document.body.scrollHeight - window.innerHeight * 0.5 &&
					!this.moviesShowsService.loadingPage
				) {
					moviesShowsService.loadMoreSearchResults();
				}
			}
		});
	}

	searchTMDBMovieShow(searchTitle: string) {
		this.router.navigate(["app-movies-shows"]);

		this.showResults = true;

		this.scrollTop();
		this.moviesShowsService.loadSearchResults(searchTitle);

	}

	loadVideo(mediaItem: IMediaInfo) {
		this.showResults = false;
		this.moviesShowsService.loadMedia(mediaItem);
	}

	scrollTop() {
		window.scrollTo({ top: 0 });
	}

	blur(inputElement: HTMLInputElement) {
		inputElement.blur();
	}
}
