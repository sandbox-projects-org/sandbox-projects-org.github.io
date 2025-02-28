import { Component } from "@angular/core";
import { VidsrcService } from "../services/vidsrc.service";
import { TmdbService } from "../services/tmdb.service";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { IEpisodeInfo, IMediaInfo, ISeasonInfo } from "../interfaces";
import { EMediaType } from "../constants";
import { AngularMaterialModule } from "../../../shared/modules/angular-material.module";

@Component({
	selector: "app-video-player",
	standalone: true,
	imports: [AngularMaterialModule],
	templateUrl: "./video-player.component.html",
	styleUrl: "./video-player.component.scss",
})
export class VideoPlayerComponent {
	EMediaType = EMediaType;

	isLoading = true;

	mediaURL: SafeResourceUrl = "";
	mediaItem: IMediaInfo;
	seasonsEpisodes: Map<number, ISeasonInfo> = new Map();

	constructor(
		private vidsrcService: VidsrcService,
		public tmdbService: TmdbService,
		private domSanitizer: DomSanitizer
	) {
		this.mediaItem = history.state.mediaItem;
		if (!this.mediaItem.season || !this.mediaItem.episode) {
			this.mediaItem.season = 1;
			this.mediaItem.episode = 1;
		}
		this.loadMedia(this.mediaItem);
	}

	loadMedia(mediaItem: IMediaInfo) {
		this.mediaURL = "";
		if (mediaItem.media_type === EMediaType.MOVIE) {
			this.loadMovie(mediaItem);
		} else {
			this.loadShow(mediaItem);
		}
	}

	loadMovie(mediaItem: IMediaInfo) {
		this.vidsrcService.getTMDBMovie(mediaItem.id).subscribe({
			next: (response) => {
				this.mediaURL = this.getMediaURL(response);
			},
			error: (err) => {
				this.isLoading = false;
				console.log(err);
			},
			complete: () => {
				this.isLoading = false;
				console.log("completed loading movie");
			},
		});
	}

	loadShow(mediaItem: IMediaInfo) {
		this.vidsrcService
			.getTMDBShow(mediaItem.id, mediaItem.season!, mediaItem.episode!)
			.subscribe({
				next: (response) => {
					this.mediaURL = this.getMediaURL(response);
					this.getEpisodeDetails(mediaItem);
					this.getSeasonsEpisodesMap(mediaItem.id);
				},
				error: (err) => {
					this.isLoading = false;
					console.log(err);
				},
				complete: () => {
					this.isLoading = false;
					console.log("completed loading movie");
				},
			});
	}

	getEpisodeDetails(mediaItem: IMediaInfo) {
		if (mediaItem.media_type === EMediaType.TV) {
			this.tmdbService
				.getEpisodeDetails(mediaItem.id, mediaItem.season!, mediaItem.episode!)
				.subscribe({
					next: (response) => {
						this.mediaItem.episode_title = response.name;
						this.mediaItem.episode_overview = response.overview;
					},
					error: (err) => {
						console.log(err);
					},
					complete: () => {
						console.log("completed getting episode details");
					},
				});
		}
	}

	changeSeason() {
		this.mediaItem.episode = 1;
		this.loadShow(this.mediaItem);
		history.replaceState({ mediaItem: this.mediaItem }, "", location.href);
	}
	changeEpisode() {
		this.loadShow(this.mediaItem);
		history.replaceState({ mediaItem: this.mediaItem }, "", location.href);
	}

	getMediaURL(html: string): SafeResourceUrl {
		const parser = new DOMParser();
		const htmlDoc = parser.parseFromString(html, "text/html");

		// const movieTitle = htmlDoc.querySelector('title')!.text;
		var iframeSource = htmlDoc
			.querySelector("iframe#player_iframe")!
			.getAttribute("src")!;

		return this.domSanitizer.bypassSecurityTrustResourceUrl(iframeSource);
	}

	getSeasonsEpisodesMap(titleID: string) {
		this.seasonsEpisodes = new Map();
		this.tmdbService.getShowDetails(titleID).subscribe({
			next: (response) => {
				for (const season of response.seasons) {
					if (season.season_number > 0) {
						this.seasonsEpisodes.set(season.season_number, {
							season_number: season.season_number,
							name: season.name,
							episode_count: season.episode_count,
							episodes: this.createEpisodeItemList(
								titleID,
								season.season_number
							),
						});
					}
				}
			},
			error: (err) => {
				console.log(err);
			},
			complete: () => {
				console.log("completed creating seasonsEpisodeMap");
			},
		});
	}

	createEpisodeItemList(titleID: string, season: number): IEpisodeInfo[] {
		var episodeItemList: IEpisodeInfo[] = [];
		this.tmdbService.getSeasonDetails(titleID, season).subscribe({
			next: (response) => {
				for (const episode of response.episodes) {
					episodeItemList.push({
						episode_number: episode.episode_number,
						name: episode.name,
						overview: episode.overview,
					});
				}
			},
			error: (err) => {
				console.log(err);
			},
			complete: () => {
				console.log("completed creating episodes list");
			},
		});
		return episodeItemList;
	}
}
