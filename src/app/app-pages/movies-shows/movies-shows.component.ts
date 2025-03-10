import { Component } from "@angular/core";
import { AngularMaterialModule } from "../../shared/modules/angular-material.module";
import { IMediaInfo } from "./interfaces";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
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
		private route: ActivatedRoute,
		public moviesShowsService: MoviesShowsService
	) {
		route.queryParams.subscribe({
			next: (params) => {
				if (params["search"]) {
					moviesShowsService.loadSearchResults(params["search"]);
					this.showResults = true;
				} else {
					this.showResults = false;
				}
			},
			error: (err) => {
				console.log("search error");
				console.log(err);
			},
			complete: () => {
				console.log("completed search");
			},
		});

		// scroll to top of page before reloading
		window.addEventListener('beforeunload', (event) => {
			this.scrollTop()
		})

		// infinite scroll for paging
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
		this.scrollTop();

		this.moviesShowsService.loadSearchResults(searchTitle);
		this.moviesShowsService.searchState$.subscribe({
			next: (searchState) => {
				if (searchState!.results.length < 12 && searchState!.page < searchState!.total_pages) {
					this.moviesShowsService.loadMoreSearchResults()
				}
			}
		})
	}

	loadVideo(mediaItem: IMediaInfo) {
		this.showResults = false;
		this.moviesShowsService.updateMediaState(mediaItem)
	}

	scrollTop() {
		window.scrollTo({ top: 0 });
	}

	blur(inputElement: HTMLInputElement) {
		inputElement.blur();
	}
}
