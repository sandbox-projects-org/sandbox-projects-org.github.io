import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AngularMaterialModule } from '../shared/modules/angular-material.module';
import { VidsrcService } from './services/vidsrc.service';
import { OmdbService } from './services/omdb.service';
import { TmdbService } from './services/tmdb.service';
import { IMediaInfo } from './interfaces';
import { EMediaType } from './constants';

@Component({
  selector: 'app-vidsrc-movies-shows',
  standalone: true,
  imports: [AngularMaterialModule],
  templateUrl: './vidsrc-movies-shows.component.html',
  styleUrl: './vidsrc-movies-shows.component.scss'
})
export class VidsrcMoviesShowsComponent{

  hasSearched = false;
  isLoading = false;

  mediaURL: SafeResourceUrl = '';
  searchResult: IMediaInfo[] = [];
  seasonsEpisodes: Map<number, number[]> = new Map();

  selectedMediaID: string = '';
  selectedMediaType: EMediaType = EMediaType.MOVIE
  selectedSeason: number = 1;
  selectedEpisode: number = 1;

  constructor(
    private vidsrcService: VidsrcService,
    private domSanitizer: DomSanitizer,
    private omdbService: OmdbService,
    private tmdbService: TmdbService
  ){}

  searchTMDBMovieShow(value: string) {
    this.searchResult = [];

    this.tmdbService.getMoviesShows(value).subscribe({
      next: (response) => {
        for (const media of response.results) {
          if (media.media_type === EMediaType.MOVIE) {
            var mediaItem: IMediaInfo = {
              id: media.id,
              title: media.title,
              media_type: EMediaType.MOVIE,
              release_date: media.release_date,
              overview: media.overview,
              poster_path: `${this.tmdbService.TMDB_POSTER_PATH_URL}${media.poster_path}`
            };
            this.searchResult.push(mediaItem);
          }
          if (media.media_type === EMediaType.TV) {
            var mediaItem: IMediaInfo = {
              id: media.id,
              title: media.name,
              media_type: EMediaType.TV,
              release_date: media.first_air_date,
              overview: media.overview,
              poster_path: `${this.tmdbService.TMDB_POSTER_PATH_URL}${media.poster_path}`
            };
            this.searchResult.push(mediaItem);
          }
        }
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('completed search')
        this.hasSearched = true;
      }
    })
  }

  loadMovie(tmdbID: string) {
    this.isLoading = true;
    this.vidsrcService.getTMDBMovie(tmdbID).subscribe({
      next: (response) => {
        this.mediaURL = this.getMediaURL(response.body!);
        this.selectedMediaID = tmdbID;
        this.selectedMediaType = EMediaType.MOVIE;
      },
      error: (err) => {
        this.mediaURL = '';
        this.selectedMediaID = '';
        this.isLoading = false;
        console.log(err);
      },
      complete: () => {
        this.isLoading = false;
        console.log('completed loading movie');
      }
    })
  }

  loadShow(tmdbID: string, season: number = 1, episode: number = 1) {
    this.isLoading = true;
    this.vidsrcService.getTMDBShow(tmdbID, season, episode).subscribe({
      next: (response) => {
        this.mediaURL = this.getMediaURL(response.body!)
        this.selectedMediaID = tmdbID;
        this.selectedMediaType = EMediaType.TV;
        this.getSeasonsEpisodes(tmdbID)
      },
      error: (err) => {
        this.mediaURL = '';
        this.selectedMediaID = '';
        this.isLoading = false;
        console.log(err);
      },
      complete: () => {
        this.isLoading = false;
        console.log('completed loading movie');
      }
    })
  }
  
  getSeasonsEpisodes(titleID: string) {
    this.seasonsEpisodes = new Map();
    this.tmdbService.getShowSeasonsEpisodes(titleID).subscribe({
      next: (response) => {
        for (const season of response) {
          var episodeList = [];
          for (var i = 1; i <= season.episode_count; i++) {
            episodeList.push(i);
          }
          this.seasonsEpisodes.set(season.season_number, episodeList)
        }
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('completed getting episodes');
      }
    })
  }

  changeSeasonEpisode() {
    this.loadShow(this.selectedMediaID, this.selectedSeason, this.selectedEpisode)
  }

  getMediaURL(html: string): SafeResourceUrl {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(html, 'text/html');
    
    // const movieTitle = htmlDoc.querySelector('title')!.text;
    var iframeSource = htmlDoc.querySelector('iframe#player_iframe')!.getAttribute('src')!;
    
    // var movieSources = htmlDoc.querySelector('div.servers');
    return this.domSanitizer.bypassSecurityTrustResourceUrl(iframeSource);
  }
}
