import { Injectable } from "@angular/core";
import { TmdbService } from "./services/tmdb.service";
import {
	BehaviorSubject,
	catchError,
	concat,
	concatMap,
	forkJoin,
	map,
	Observable,
	of,
	Subscription,
	switchMap,
	tap,
} from "rxjs";
import {
	IEpisodeInfo,
	IMediaInfo,
	ISearchResults,
	ISeasonInfo,
} from "./interfaces";
import {
	ActivatedRoute,
	IsActiveMatchOptions,
	Route,
	Router,
} from "@angular/router";
import { EMediaType } from "./constants";
import { VidsrcService } from "./services/vidsrc.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Injectable({
	providedIn: "root",
})
export class MoviesShowsService {
	movieGenres: Map<number, string> = new Map();
	tvGenres: Map<number, string> = new Map();

	subscriptionList: Subscription[] = [];

	loadingPage = false;

	private _searchStateSubject = new BehaviorSubject<ISearchResults | null>(
		null
	);
	public searchState$ = this._searchStateSubject.asObservable();

	private _mediaStateSubject = new BehaviorSubject<IMediaInfo | null>(null);
	public mediaState$ = this._mediaStateSubject.asObservable();
	mediaStateBeforeURL: IMediaInfo | null = null;

	constructor(
		private tmdbService: TmdbService,
		private vidsrcService: VidsrcService,
		private domSanitizer: DomSanitizer,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.subscriptionList.push(tmdbService.getMovieGenres().subscribe({
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
		}));
		this.subscriptionList.push(tmdbService.getTVGenres().subscribe({
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
		}));
	}

	updateSearchState(newSearchResults: ISearchResults) {
		this._searchStateSubject.next(newSearchResults);
		localStorage.setItem("searchState", JSON.stringify(newSearchResults));
		history.replaceState({searchState: newSearchResults}, '', `${window.location.origin}/app-movies-shows`)
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

		this.subscriptionList.push(
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
										genres: this._getGenres(media.genre_ids, EMediaType.MOVIE),
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
										genres: this._getGenres(media.genre_ids, EMediaType.TV),
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
				})
		);
	}

	private _getGenres(genreIds: number[], media_type: EMediaType): string[] {
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
		this._mediaStateSubject.next(newMediaItem);

		if (newMediaItem.media_type === EMediaType.MOVIE) {
			localStorage.setItem('mediaState', JSON.stringify(newMediaItem))
		}
		else {
			var JSONtoString: any = structuredClone(newMediaItem);
			JSONtoString.seasonsEpisodes = Object.fromEntries(
				newMediaItem.seasonsEpisodes!
			);
			localStorage.setItem("mediaState", JSON.stringify(JSONtoString));
		}
		
		this.router.navigate(["app-movies-shows/app-video-player"], {state: {mediaState: newMediaItem}});

	}

	loadMedia(mediaItem: IMediaInfo) {
		if (mediaItem.media_type === EMediaType.MOVIE) {
			this.mediaStateBeforeURL = mediaItem;

			// this is duplicated code from this.loadShowSeasonEpisodeMeta()
			this.subscriptionList.push(this.vidsrcService.getTMDBMovie(mediaItem.id).pipe(
				concatMap((responseHTML) => {
					var newMediaItem: IMediaInfo = structuredClone(mediaItem)!;
					newMediaItem.media_url = this.getMediaURL(responseHTML);
					return of(newMediaItem);
				}),
				catchError((err) => {
					return of(this.mediaStateBeforeURL!);
				})
			).subscribe({
				next: (newMediaItem) => {
					this.updateMediaState(newMediaItem);
				},
				error: (err) => {
					console.log(err)
				},
				complete: () => {
					console.log('completed loading movie')
				}
			}));
		} else {
			this.loadShowSeasonEpisodeMeta(mediaItem);
		}
	}

	loadShowSeasonEpisodeMeta(mediaItem: IMediaInfo) {
		this.subscriptionList.push(this.getEpisodeDetails(mediaItem)
			.pipe(
				concatMap((responseMediaItem) => {
					var newMediaItem: IMediaInfo = structuredClone(responseMediaItem);
					if (!newMediaItem.seasonsEpisodes) {
						return this.getSeasonsEpisodesMap(mediaItem.id).pipe(
							concatMap((responseSeasonEpisodes) => {
								var newSeasonsEpisodes: Map<number, ISeasonInfo> =
									structuredClone(responseSeasonEpisodes);
								for (const season of newSeasonsEpisodes.keys()) {
									this.subscriptionList.push(this.createEpisodeItemList(newMediaItem.id, season).subscribe(
										{
											next: (response) => {
												var newSeasonItem: ISeasonInfo = structuredClone(
													newSeasonsEpisodes.get(season)!
												);
												newSeasonItem.episodes = structuredClone(response);
												newSeasonsEpisodes.set(season, newSeasonItem);
											},
											error: (err) => {
												console.log(err);
											},
											complete: () => {
												console.log("completed creating episodes list");
											},
										}
									));
								}
								newMediaItem.seasonsEpisodes = newSeasonsEpisodes;
								return of(newMediaItem);
							})
						);
					} else {
						return of(newMediaItem);
					}
				})
			)
			.pipe(
				tap((mediaItem) => {
					this.mediaStateBeforeURL = mediaItem;
				}),
				concatMap((mediaItem) => {
					if (mediaItem?.media_type === EMediaType.MOVIE) {
						return this.vidsrcService.getTMDBMovie(mediaItem.id).pipe(
							concatMap((responseHTML) => {
								var newMediaItem: IMediaInfo = structuredClone(mediaItem)!;
								newMediaItem.media_url = this.getMediaURL(responseHTML);
								return of(newMediaItem);
							})
						);
					} else {
						return this.vidsrcService
							.getTMDBShow(
								mediaItem?.id ? mediaItem.id : "",
								mediaItem?.season!,
								mediaItem?.episode!
							)
							.pipe(
								concatMap((responseHTML) => {
									var newMediaItem: IMediaInfo = structuredClone(mediaItem)!;
									newMediaItem.media_url = this.getMediaURL(responseHTML);
									return of(newMediaItem);
								})
							);
					}
				}),
				catchError((err) => {
					return of(this.mediaStateBeforeURL!);
				})
			)
			.subscribe({
				next: (newMediaItem) => {
					this.updateMediaState(newMediaItem);
				},
				error: (err) => {
					console.log(err);
				},
				complete: () => {
					console.log("completed loading show");
				},
			}));
	}

	getSeasonsEpisodesMap(titleID: string): Observable<Map<number, ISeasonInfo>> {
		return this.tmdbService.getShowDetails(titleID).pipe(
			concatMap((response) => {
				var seasonsEpisodes: Map<number, ISeasonInfo> = new Map();

				for (const season of response.seasons) {
					if (season.season_number > 0) {
						var seasonItem: ISeasonInfo = {
							season_number: season.season_number,
							name: season.name,
							episode_count: season.episode_count,
							episodes: [],
						};
						seasonsEpisodes.set(season.season_number, seasonItem);
					}
				}
				return of(seasonsEpisodes);
			})
		);
	}

	createEpisodeItemList(
		titleID: string,
		season: number
	): Observable<IEpisodeInfo[]> {
		return this.tmdbService.getSeasonDetails(titleID, season).pipe(
			concatMap((response) => {
				var episodeItemList: IEpisodeInfo[] = [];
				for (const episode of response.episodes) {
					episodeItemList.push({
						episode_number: episode.episode_number,
						name: episode.name,
						overview: episode.overview,
					});
				}
				return of(episodeItemList);
			})
		);
	}

	changeSeason(season: number) {
		var newMediaItem: IMediaInfo = structuredClone(
			this._mediaStateSubject.getValue()
		)!;
		newMediaItem.season = season;
		newMediaItem.episode = 1;
		

		this.loadMedia(newMediaItem);

	}

	changeEpisode(episode: number) {
		var newMediaItem: IMediaInfo = structuredClone(
			this._mediaStateSubject.getValue()
		)!;
		newMediaItem.episode = episode;

		this.loadMedia(newMediaItem);

	}

	getEpisodeDetails(mediaItem: IMediaInfo): Observable<IMediaInfo> {
		return this.tmdbService
			.getEpisodeDetails(mediaItem.id, mediaItem.season!, mediaItem.episode!)
			.pipe(
				concatMap((response) => {
					var newMediaItem: IMediaInfo = structuredClone(mediaItem);
					newMediaItem.episode_title = response.name;
					newMediaItem.episode_overview = response.overview;
					return of(newMediaItem);
				})
			);
	}

	getMediaURL(html: string): SafeResourceUrl {
		const parser = new DOMParser();
		const htmlDoc = parser.parseFromString(html, "text/html");

		// const movieTitle = htmlDoc.querySelector('title')!.text;
		var iframeSource = htmlDoc
			.querySelector("iframe#player_iframe")!
			.getAttribute("src")!;

		const url = `https:${iframeSource}`;

		return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
	}
}
