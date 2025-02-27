import { Component } from "@angular/core";
import { AngularMaterialModule } from "../../shared/modules/angular-material.module";
import { TmdbService } from "./services/tmdb.service";
import { IMediaInfo, ISearchResults } from "./interfaces";
import { EMediaType } from "./constants";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";

@Component({
	selector: "app-movies-shows",
	standalone: true,
	imports: [AngularMaterialModule, RouterOutlet],
	templateUrl: "./movies-shows.component.html",
	styleUrl: "./movies-shows.component.scss",
})
export class MoviesShowsComponent {
	EMediaType = EMediaType;
	isLoadingSearch = false;
	showResults = false;

	searchResult: ISearchResults = {
		title: "",
		results: [],
		page: 1,
		total_pages: 0,
		total_results: 0,
	};
	resetSearchResult: ISearchResults = {
		title: "",
		results: [],
		page: 1,
		total_pages: 0,
		total_results: 0,
	};

	constructor(
		private tmdbService: TmdbService,
		private router: Router,
		private route: ActivatedRoute
	) {
		window.addEventListener("popstate", (event) => {
			if (location.pathname === "/app-movies-shows") {
				this.showResults = true;
			}
			if (location.pathname === "/app-movies-shows/app-video-player") {
				this.showResults = false;
			}
		});
		window.addEventListener("scroll", (event) => {
			if (location.pathname === "/app-movies-shows") {
				if (
					window.scrollY + window.innerHeight >
					document.body.scrollHeight - window.innerHeight * 0.5
				) {
					this.loadMoreSearchResults();
				}
			}
		});
	}

	searchTMDBMovieShow(searchTitle: string) {
		this.router.navigate(["app-movies-shows"]);

		this.searchResult = structuredClone(this.resetSearchResult);
		this.searchResult.title = searchTitle;
		this.isLoadingSearch = true;
		this.showResults = true;

		this.loadSearchResults(searchTitle, this.searchResult.page);
	}

	loadSearchResults(title: string, page: number) {
		this.tmdbService.getMoviesShows(title, page).subscribe({
			next: (response) => {
				this.searchResult.total_pages = response.total_pages;
				this.searchResult.total_results = response.total_results;

				for (const media of response.results) {
					if (media.media_type === EMediaType.MOVIE) {
						var mediaItem: IMediaInfo = {
							id: media.id,
							title: media.title,
							media_type: EMediaType.MOVIE,
							release_date: media.release_date ? media.release_date : "unknown",
							overview: media.overview ? media.overview : "",
							poster_path: media.poster_path
								? `${this.tmdbService.TMDB_POSTER_PATH_URL}${media.poster_path}`
								: "/assets/no_image.jpg",
						};
						this.searchResult.results.push(mediaItem);
					}
					if (media.media_type === EMediaType.TV) {
						var mediaItem: IMediaInfo = {
							id: media.id,
							title: media.name,
							media_type: EMediaType.TV,
							release_date: media.first_air_date
								? media.first_air_date
								: "unknown",
							overview: media.overview ? media.overview : "",
							poster_path: media.poster_path
								? `${this.tmdbService.TMDB_POSTER_PATH_URL}${media.poster_path}`
								: "/assets/no_image.jpg",
						};
						this.searchResult.results.push(mediaItem);
					}
				}
			},
			error: (err) => {
				this.isLoadingSearch = false;
				console.log(err);
			},
			complete: () => {
				this.isLoadingSearch = false;
				history.replaceState(
					{ searchResult: this.searchResult },
					"",
					location.href
				);
				console.log("completed search");
			},
		});
	}

	loadMoreSearchResults() {
		if (this.searchResult.page < this.searchResult.total_pages) {
			++this.searchResult.page;
			this.loadSearchResults(this.searchResult.title, this.searchResult.page);
		}
	}

	loadVideo(mediaItem: IMediaInfo) {
		history.replaceState(
			{ searchResult: this.searchResult },
			"",
			location.href
		);
		this.showResults = false;
		this.router.navigate(["app-video-player"], {
			relativeTo: this.route,
			state: { mediaItem: mediaItem },
		});
	}
}
