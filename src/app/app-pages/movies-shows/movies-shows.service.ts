import { Injectable } from "@angular/core";
import { TmdbService } from "./services/tmdb.service";
import {
	BehaviorSubject,
	concatMap,
	EMPTY,
	expand,
	forkJoin,
	Observable,
	of,
} from "rxjs";
import {
	IMediaInfo,
	IMediaState,
	ISearchResults,
} from "./interfaces";
import { Router } from "@angular/router";
import { EMediaType } from "./constants";

@Injectable({
	providedIn: "root",
})
export class MoviesShowsService {
	movieGenres: Map<number, string> = new Map();
	tvGenres: Map<number, string> = new Map();

	showSearchResults = false;
	loadingPage = false;

	private _searchStateSubject = new BehaviorSubject<ISearchResults | null>(
		null
	);
	public searchState$ = this._searchStateSubject.asObservable();

	constructor(private tmdbService: TmdbService, private router: Router) {}

	updateSearchState(newSearchResults: ISearchResults) {
		this._searchStateSubject.next(newSearchResults);
		this.showSearchResults = true;
	}

	loadSearchResults(title: string, newSearchTitle: boolean) {
		if (newSearchTitle || this._searchStateSubject.getValue()!.page < this._searchStateSubject.getValue()!.total_pages) {
			this.loadingPage = true;
			const page = newSearchTitle
				? 1
				: ++this._searchStateSubject.getValue()!.page;
			const previousLength = (this._searchStateSubject.getValue()?.results.length && !newSearchTitle) ? this._searchStateSubject.getValue()!.results.length : 0;
	
			if (title === "") {
				this.loadSearchResultsOperator(
					this.tmdbService.getTrending(page),
					title,
					page
				).pipe(
					expand(searchResults => {
						if (searchResults.results.length - previousLength < 10 && searchResults.page < searchResults.total_pages) {
							++searchResults.page
							return this.loadSearchResultsOperator(this.tmdbService.getMoviesShows(title, searchResults.page), title, searchResults.page)
						}
						else {
							return EMPTY
						}
					})
				).subscribe({
					next: (response) => {
						this.updateSearchState(response);
					},
					error: (err) => {
						console.log(err);
					},
					complete: () => {
						this.loadingPage = false;
						console.log("completed loading trending search results");
					},
				});
			}
	
			else {
				this.loadSearchResultsOperator(
					this.tmdbService.getMoviesShows(title, page),
					title,
					page
				).pipe(
					expand(searchResults => {
						if (searchResults.results.length - previousLength < 10 && searchResults.page < searchResults.total_pages) {
							++searchResults.page
							return this.loadSearchResultsOperator(this.tmdbService.getMoviesShows(title, searchResults.page), title, searchResults.page)
						}
						else {
							return EMPTY
						}
					})
				).subscribe({
					next: (response) => {
						this.updateSearchState(response);
					},
					error: (err) => {
						console.log(err);
					},
					complete: () => {
						this.loadingPage = false;
						console.log("completed loading search results");
					},
				});
			}
		}
	}

	loadSearchResultsOperator(
		searchObservable$: Observable<any>,
		title: string,
		page: number
	): Observable<ISearchResults> {
		return searchObservable$.pipe(
			concatMap((searchResults) => {
				var genresMaps: Observable<Map<number, string>>[] = [];
				genresMaps.push(
					this.tmdbService.getMovieGenres().pipe(
						concatMap((movieGenresResponse) => {
							var newMovieGenresMap: Map<number, string> = new Map();
							for (const genre of movieGenresResponse) {
								newMovieGenresMap.set(genre.id, genre.name);
							}
							return of(newMovieGenresMap);
						})
					)
				);

				genresMaps.push(
					this.tmdbService.getTVGenres().pipe(
						concatMap((tvGenresResponse) => {
							var newTvGenresMap: Map<number, string> = new Map();
							for (const genre of tvGenresResponse) {
								newTvGenresMap.set(genre.id, genre.name);
							}
							return of(newTvGenresMap);
						})
					)
				);

				return forkJoin(genresMaps).pipe(
					concatMap((newGenresMaps) => {
						this.movieGenres = newGenresMaps[0];
						this.tvGenres = newGenresMaps[1];

						return of(searchResults).pipe(
							concatMap((response) => {
								var newSearchResults: ISearchResults;
								if (page === 1) {
									newSearchResults = {
										title: title,
										results: [],
										page: page,
										total_pages: 1,
									};
									newSearchResults.total_pages = response.total_pages;
								} else {
									newSearchResults = structuredClone(
										this._searchStateSubject.getValue()!
									);
								}
								for (const media of response.results) {
									if (
										media.poster_path &&
										(media.media_type === EMediaType.MOVIE ||
											media.media_type === EMediaType.TV)
									) {
										if (media.media_type === EMediaType.MOVIE) {
											var mediaItem: IMediaInfo = {
												id: media.id,
												title: media.title,
												media_type: EMediaType.MOVIE,
												release_date: media.release_date
													? new Date(media.release_date)
															.getFullYear()
															.toString()
													: "XXXX",
												overview: media.overview ? media.overview : "",
												poster_path: `${this.tmdbService.TMDB_POSTER_PATH_URL}${media.poster_path}`,
												genres: this.getGenres(
													media.genre_ids,
													EMediaType.MOVIE
												),
											};
											newSearchResults.results.push(mediaItem);
										}
										if (media.media_type === EMediaType.TV) {
											var mediaItem: IMediaInfo = {
												id: media.id,
												title: media.name,
												media_type: EMediaType.TV,
												release_date: media.first_air_date
													? new Date(media.first_air_date)
															.getFullYear()
															.toString()
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
								return of(newSearchResults)
							})
						);
					})
				);
			})
		);
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
			if (genres === "") {
				genres = genre;
			} else {
				genres += `, ${genre}`;
			}
		}
		return genres;
	}

	updateMediaState(newMediaItem: IMediaInfo) {
		this.showSearchResults = false;

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
		});
	}
}
