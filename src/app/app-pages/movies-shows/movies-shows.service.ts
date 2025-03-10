import { Injectable } from "@angular/core";
import { TmdbService } from "./services/tmdb.service";
import {
	BehaviorSubject,
	concatMap,
	of,
} from "rxjs";
import {
	IMediaInfo,
	IMediaState,
	ISearchResults,
	ISearchState,
} from "./interfaces";
import { Router } from "@angular/router";
import { EMediaType } from "./constants";

@Injectable({
	providedIn: "root",
})
export class MoviesShowsService {
	movieGenres: Map<number, string> = new Map();
	tvGenres: Map<number, string> = new Map();

	loadingPage = false;

	private _searchStateSubject = new BehaviorSubject<ISearchResults | null>(
		null
	);
	public searchState$ = this._searchStateSubject.asObservable();

	private _mediaStateSubject = new BehaviorSubject<IMediaInfo | null>(null);
	public mediaState$ = this._mediaStateSubject.asObservable();

	constructor(private tmdbService: TmdbService, private router: Router) {
		tmdbService.getMovieGenres().subscribe({
			next: (response) => {
				for (const genre of response) {
					this.movieGenres.set(genre.id, genre.name);
				}
			},
			error: (err) => {
				console.log(err);
			},
			complete: () => {
				console.log("completed getting movie genre list");
			},
		});

		tmdbService.getTVGenres().subscribe({
			next: (response) => {
				for (const genre of response) {
					this.tvGenres.set(genre.id, genre.name);
				}
			},
			error: (err) => {
				console.log(err);
			},
			complete: () => {
				console.log("completed getting tv genre list");
			},
		});
	}

	updateSearchState(newSearchResults: ISearchResults) {
		this._searchStateSubject.next(newSearchResults);
		var queryParamObject: ISearchState = {
			search: newSearchResults.title,
		};
		this.router.navigate(["app-movies-shows"], {
			queryParams: queryParamObject,
		});
	}

	loadMoreSearchResults(pagesToLoad: number = 1) {
		for (let page = 1; page <= pagesToLoad; page++) {
			if (
				this._searchStateSubject.getValue()!.page <
				this._searchStateSubject.getValue()!.total_pages
			) {
				this.loadSearchResults(
					this._searchStateSubject.getValue()!.title,
					++this._searchStateSubject.getValue()!.page
				);
			}
		}
	}

	loadSearchResults(title: string, page: number = 1) {
		this.loadingPage = true;

		this.tmdbService
			.getMoviesShows(title, page)
			.pipe(
				concatMap((response) => {
					var newSearchResults: ISearchResults;

					if (page === 1) {
						newSearchResults = {
							title: title,
							results: [],
							page: page,
							total_pages: 1,
							total_results: 0,
						};
						newSearchResults.total_pages = response.total_pages;
						newSearchResults.total_results = response.total_results;
					} else {
						newSearchResults = structuredClone(
							this._searchStateSubject.getValue()!
						);
						newSearchResults.page = page;
					}

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
									genres: this.getGenres(media.genre_ids, EMediaType.MOVIE),
								};
								newSearchResults.results.push(mediaItem);
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
									season: 1,
									episode: 1,
									genres: this.getGenres(media.genre_ids, EMediaType.TV),
								};
								newSearchResults.results.push(mediaItem);
							}
						}
					}
					return of(newSearchResults);
				})
			)
			.subscribe({
				next: (response) => {
					this.updateSearchState(response);
				},
				error: (err) => {
					console.log(err);
				},
				complete: () => {
					this.loadingPage = false;
					console.log("completed search");
				},
			});
	}

	private getGenres(genreIds: number[], media_type: EMediaType): string[] {
		var genreList: string[] = [];
		if (media_type === EMediaType.MOVIE) {
			for (const id of genreIds) {
				genreList.push(this.movieGenres.get(id)!);
			}
		} else {
			for (const id of genreIds) {
				genreList.push(this.tvGenres.get(id)!);
			}
		}
		return genreList;
	}

	genreListToString(mediaItem: IMediaInfo): string {
		var genres = "";
		for (const genre of mediaItem.genres) {
			if (genres.length === 0) {
				genres = genre;
			} else {
				genres += `, ${genre}`;
			}
		}
		return genres;
	}

	updateMediaState(newMediaItem: IMediaInfo) {
		var queryParamObject: IMediaState = {
			id: newMediaItem.id,
			media_type: newMediaItem.media_type,
		};
		if (newMediaItem.media_type === EMediaType.TV) {
			(queryParamObject.season = newMediaItem.season),
				(queryParamObject.episode = newMediaItem.episode);
		}

		this.router.navigate(["app-movies-shows/app-video-player"], {
			queryParams: queryParamObject,
			state: { mediaState: newMediaItem },
		});
	}
}
