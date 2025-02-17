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

  EMediaType = EMediaType;

  hasSearched = false;
  isLoadingSearch = false;
  isLoadingMedia = false;

  mediaURL: SafeResourceUrl = '';
  searchResult: IMediaInfo[] = [];
  seasonsEpisodes: Map<number, number[]> = new Map();

  selectedMediaItem: IMediaInfo | null = null;
  selectedSeason: number = 1;
  selectedEpisode: number = 1;

  constructor(
    private vidsrcService: VidsrcService,
    private domSanitizer: DomSanitizer,
    private omdbService: OmdbService,
    private tmdbService: TmdbService
  ){
  }

  searchTMDBMovieShow(value: string) {
    this.searchResult = [];
    this.isLoadingSearch = true;
    this.selectedMediaItem = null;

    this.tmdbService.getMoviesShows(value).subscribe({
      next: (response) => {
        console.log(response)
        for (const media of response.results) {
          console.log(media.title ? media.title : media.name)
          console.log(media.poster_path ? 'yes' : 'no')
          if (media.media_type === EMediaType.MOVIE) {
            var mediaItem: IMediaInfo = {
              id: media.id,
              title: media.title,
              media_type: EMediaType.MOVIE,
              release_date: media.release_date ? media.release_date : 'unknown',
              overview: media.overview ? media.overview : '',
              poster_path: media.poster_path ? `${this.tmdbService.TMDB_POSTER_PATH_URL}${media.poster_path}`: '/assets/no_poster.jpg'
            };
            this.searchResult.push(mediaItem);
          }
          if (media.media_type === EMediaType.TV) {
            var mediaItem: IMediaInfo = {
              id: media.id,
              title: media.name,
              media_type: EMediaType.TV,
              release_date: media.first_air_date ? media.first_air_date : 'unknown',
              overview: media.overview ? media.overview : '',
              poster_path: media.poster_path ? `${this.tmdbService.TMDB_POSTER_PATH_URL}${media.poster_path}`: '/assets/no_poster.jpg'
            };
            this.searchResult.push(mediaItem);
          }
        }
        console.log(this.searchResult)
      },
      error: (err) => {
        this.hasSearched = true;
        this.isLoadingSearch = false;
        console.log(err);
      },
      complete: () => {
        this.hasSearched = true;
        this.isLoadingSearch = false;
        console.log('completed search')
      }
    })
  }

  loadMovie(movieItem: IMediaInfo) {
    this.isLoadingMedia = true;
    this.selectedMediaItem = movieItem;
    this.vidsrcService.getTMDBMovie(movieItem.id).subscribe({
      next: (response) => {
        this.mediaURL = this.getMediaURL(response.body!);
      },
      error: (err) => {
        this.mediaURL = '';
        this.isLoadingMedia = false;
        console.log(err);
      },
      complete: () => {
        this.isLoadingMedia = false;
        console.log('completed loading movie');
      }
    })
  }

  loadShow(mediaItem: IMediaInfo, season: number = 1, episode: number = 1) {
    this.isLoadingMedia = true;
    this.selectedMediaItem = mediaItem;
    this.selectedSeason = season;
    this.selectedEpisode = episode;
    this.vidsrcService.getTMDBShow(mediaItem.id, season, episode).subscribe({
      next: (response) => {
        this.mediaURL = this.getMediaURL(response.body!)
        this.getSeasonsEpisodes(mediaItem.id)
        this.getEpisodeDetails(mediaItem)
      },
      error: (err) => {
        this.mediaURL = '';
        this.isLoadingMedia = false;
        console.log(err);
      },
      complete: () => {
        this.isLoadingMedia = false;
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

  getEpisodeDetails(mediaItem: IMediaInfo) {
    if (mediaItem.media_type === EMediaType.TV) {
      this.tmdbService.getEpisodeDetails(mediaItem.id, this.selectedSeason, this.selectedEpisode).subscribe({
        next: (response) => {
          this.selectedMediaItem!.season = this.selectedSeason;
          this.selectedMediaItem!.episode = this.selectedEpisode;
          this.selectedMediaItem!.episode_title = response.name;
          this.selectedMediaItem!.episode_overview = response.overview;
        }
      })
    }
  }

  changeSeasonEpisode() {
    this.loadShow(this.selectedMediaItem!, this.selectedSeason, this.selectedEpisode)
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
