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

	movieGenres: Map<number, string> = new Map();
	tvGenres: Map<number, string> = new Map();

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
		public tmdbService: TmdbService,
		private router: Router,
		private route: ActivatedRoute
	) {
		tmdbService.getMovieGenres().subscribe({
			next: (response) => {
				for (const genre of response) {
					this.movieGenres.set(genre.id, genre.name);
				}
			},
			error: (err) => {
				console.log(err)
			},
			complete: () => {
				console.log('completed getting movie genre list')
			}
		})
		tmdbService.getTVGenres().subscribe({
			next: (response) => {
				for (const genre of response) {
					this.tvGenres.set(genre.id, genre.name);
				}
			},
			error: (err) => {
				console.log(err)
			},
			complete: () => {
				console.log('completed getting tv genre list')
			}
		})
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

		this.scrollTop();

		this.loadSearchResults(searchTitle, this.searchResult.page);
		this.loadMoreSearchResults(5);
	}

	loadSearchResults(title: string, page: number) {
		this.tmdbService.getMoviesShows(title, page).subscribe({
			next: (response) => {
				this.searchResult.total_pages = response.total_pages;
				this.searchResult.total_results = response.total_results;

				for (const media of response.results) {
					if (media.poster_path) {
						if (media.media_type === EMediaType.MOVIE) {
							var mediaItem: IMediaInfo = {
								id: media.id,
								title: media.title,
								media_type: EMediaType.MOVIE,
								release_date: media.release_date
									? new Date(media.release_date).getFullYear().toString()
									: "XXXX",
								overview: media.overview ? media.overview : "",
								poster_path: `${this.tmdbService.TMDB_POSTER_PATH_URL}${media.poster_path}`,
								genres: this.getGenres(media.genre_ids, EMediaType.MOVIE)
							};
							this.searchResult.results.push(mediaItem);
						}
						if (media.media_type === EMediaType.TV) {
							var mediaItem: IMediaInfo = {
								id: media.id,
								title: media.name,
								media_type: EMediaType.TV,
								release_date: media.first_air_date
									? new Date(media.first_air_date).getFullYear().toString()
									: "XXXX",
								overview: media.overview ? media.overview : "",
								poster_path: `${this.tmdbService.TMDB_POSTER_PATH_URL}${media.poster_path}`,
								genres: this.getGenres(media.genre_ids, EMediaType.TV)

							};
							this.searchResult.results.push(mediaItem);
						}
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

	loadMoreSearchResults(pagesToLoad: number = 1) {
		for (let page = 1; page <= pagesToLoad; page++) {
			if (this.searchResult.page < this.searchResult.total_pages) {
				++this.searchResult.page;
				this.loadSearchResults(this.searchResult.title, this.searchResult.page);
			}
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

	getGenres(genreIds: number[], media_type: EMediaType): string[] {
		var genreList: string[] = [];
		if (media_type === EMediaType.MOVIE) {
			for (const id of genreIds) {
				genreList.push(this.movieGenres.get(id)!)
			}
		}
		else {
			for (const id of genreIds) {
				genreList.push(this.tvGenres.get(id)!)
			}
		}
		return genreList;
	}

	scrollTop() {
		window.scrollTo({ top: 0 });
	}

	blur(inputElement: HTMLInputElement) {
		inputElement.blur()
	}
}
