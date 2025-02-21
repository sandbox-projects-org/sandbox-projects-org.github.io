import { Component, Sanitizer } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { AngularMaterialModule } from '../../shared/modules/angular-material.module';
import { VidsrcService } from './services/vidsrc.service';
import { OmdbService } from './services/omdb.service';
import { TmdbService } from './services/tmdb.service';
import { IEpisodeInfo, IMediaInfo, ISeasonInfo } from './interfaces';
import { EMediaType } from './constants';
import { ImdbService } from './services/imdb.service';

@Component({
  selector: 'app-movies-shows',
  standalone: true,
  imports: [AngularMaterialModule],
  templateUrl: './movies-shows.component.html',
  styleUrl: './movies-shows.component.scss'
})
export class MoviesShowsComponent {

  testingSrcDoc: SafeHtml = '';

  EMediaType = EMediaType;

  hasSearched = false;
  isLoadingSearch = false;
  isLoadingMedia = false;
  autoPlay = false;

  testMedia: SafeResourceUrl = '';
  mediaURL: SafeResourceUrl = '';
  searchResult: IMediaInfo[] = [];
  seasonsEpisodes: Map<number, ISeasonInfo> = new Map();

  selectedMediaItem: IMediaInfo | null = null;
  selectedSeason: number = 1;
  selectedEpisode: number = 1;

  constructor(
    private vidsrcService: VidsrcService,
    private domSanitizer: DomSanitizer,
    private omdbService: OmdbService,
    private tmdbService: TmdbService,
    private imdbService: ImdbService
  ){}

  searchTMDBMovieShow(value: string) {
    this.searchResult = [];
    this.isLoadingSearch = true;
    this.selectedMediaItem = null;

    this.tmdbService.getMoviesShows(value).subscribe({
      next: (response) => {
        for (const media of response.results) {
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
        this.mediaURL = this.getMediaURL(response);
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
    this.vidsrcService.getTMDBShow(mediaItem.id, season, episode, this.autoPlay).subscribe({
      next: (response) => {
        this.mediaURL = this.getMediaURL(response)
        this.getEpisodeDetails(mediaItem)

        this.getSeasonsEpisodesMap(mediaItem.id);
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
    console.log(iframeSource)

    this.vidsrcService.getSourceAgain(iframeSource).subscribe({
      next: (response) => {
        // console.log(response);
        const responsa = response;

        const beginningIndex = response.indexOf("src: '") + 6;
        const endingIndex= response.indexOf("',\n               frameborder:");
        const url = 'https://edgedeliverynetwork.com' + response.slice(beginningIndex, endingIndex);
        console.log(url)
        // this.testMedia = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
        this.vidsrcService.getSourceAgainAgain(url).subscribe({
          next: (response) => {
            // console.log(response);
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(response, 'text/html');

            // remove element that enables ads
            htmlDoc.body.lastElementChild?.remove();

            const innerSrcDoc = `srcdoc: '<!DOCTYPE html>${htmlDoc.documentElement.outerHTML}`;

            const srcDoc = responsa.slice(0, beginningIndex - 6) + innerSrcDoc + responsa.slice(endingIndex);

            this.testingSrcDoc = this.domSanitizer.bypassSecurityTrustHtml(srcDoc);

            // console.log('fat: ' + responsea);
            // console.log(responsea.slice(begIndex, endingIndex))
            console.log(responsa.slice(0, beginningIndex - 6) + innerSrcDoc)
            console.log(innerSrcDoc + 'OOOOOOOOOOOO' + responsa.slice(endingIndex))

          },
          error: (err) => {
            console.log(`ERROR: ${err}`)
          },
          complete: () => {
            console.log('asdfasdad')
          }
        })
      },
      error: (err) => {
        console.log(`ERROR: ${err}`)
      },
      complete: () => {
        console.log('asdfasdad')
      }
    })
    
    // var movieSources = htmlDoc.querySelector('div.servers');
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
              episodes: this.createEpisodeItemList(titleID, season.season_number)
            })
          }
        }
      },
      error: (err) => {
        console.log(err)
      },
      complete: () => {
        console.log('completed creating seasonsEpisodeMap')
      }
    })
  }

  createEpisodeItemList(titleID: string, season: number): IEpisodeInfo[] {
    var episodeItemList: IEpisodeInfo[] = [];
    this.tmdbService.getSeasonDetails(titleID, season).subscribe({
      next: (response) => {
        for (const episode of response.episodes) {
          episodeItemList.push({
            episode_number: episode.episode_number,
            name: episode.name,
            overview: episode.overview
          })
        }
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('completed creating episodes list')
      }
    })
    return episodeItemList;
  }
}
