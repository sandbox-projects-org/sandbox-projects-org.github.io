import { Component } from "@angular/core";
import { IMediaInfo } from "../interfaces";
import { EMediaType } from "../constants";
import { AngularMaterialModule } from "../../../shared/modules/angular-material.module";
import { MoviesShowsService } from "../movies-shows.service";

@Component({
	selector: "app-video-player",
	standalone: true,
	imports: [AngularMaterialModule],
	templateUrl: "./video-player.component.html",
	styleUrl: "./video-player.component.scss",
})
export class VideoPlayerComponent {
	EMediaType = EMediaType;

	constructor(
		public moviesShowsService: MoviesShowsService
	) {
		if (history.state.mediaState) {
			moviesShowsService.loadMedia(history.state.mediaState);
		} else if (localStorage.getItem("mediaState")) {
			var localStorageMediaState: IMediaInfo = JSON.parse(
				localStorage.getItem("mediaState")!
			);
			localStorageMediaState.seasonsEpisodes = undefined;

			moviesShowsService.loadMedia(localStorageMediaState);
		}
	}

}
