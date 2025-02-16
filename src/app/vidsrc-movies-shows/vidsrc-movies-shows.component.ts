import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularMaterialModule } from '../shared/modules/angular-material.module';
import { VidsrcService } from './services/vidsrc.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-vidsrc-movies-shows',
  standalone: true,
  imports: [AngularMaterialModule],
  templateUrl: './vidsrc-movies-shows.component.html',
  styleUrl: './vidsrc-movies-shows.component.scss'
})
export class VidsrcMoviesShowsComponent{
  description = false;

  movieURL: any = '';
  showURL: any = '';

  searchResult: any[] = [];
  tmdbSeasonsEpisodes: Map<number, number[]> = new Map()

  titleID = '';
  selectedSeason = 1;
  selectedEpisode = 1;
  hasSearchedTitle = false;
  hasLoadedVideo = false;
  movieExists = false;
  showExists = false;
  isLoading = false;

  // searchMovieShowTitle$: Observable<any>;
  // searchMovieShowId$: Observable<any>;

  constructor(
    private vidsrcService: VidsrcService,
    private domSanitizer: DomSanitizer
  ){
    // this.searchMovieShowTitle$ = new Observable();
    // this.searchMovieShowId$ = new Observable();
  }

  toggleInstructions() {
    this.description = !this.description
  }

  searchTMDBMovieShow(value: string) {
    this.searchResult = [];

    // seach directly for movie if value is IMDB id or TMDB id
    if (value.slice(0, 5) === 'imdb:' || value.slice(0, 5) === 'tmdb:') {
      var id = value.slice(5);
      this.titleID = id;
      this.loadMovieShow(this.titleID);
    }

    // search TMDB catalog
    else {
      this.hasSearchedTitle = true;
      const searchTMDB$: Observable<any> = this.vidsrcService.searchTMDB(value)
      searchTMDB$.subscribe({
        next: (httpResponse) => {
          var results: any[] = httpResponse.results;
          results.forEach(item => {
            if (item.media_type === 'movie' || item.media_type === 'tv') {
              var posterPath = item.poster_path;
              item.poster_path = `https://image.tmdb.org/t/p/w500${posterPath}`
              this.searchResult.push(item)
            }
          })
        }
      })
      
    }
  }

  loadMovieShow(titleID: string, season: number = 1, episode: number = 1) {
    this.hasLoadedVideo = true;
    this.isLoading = true;
    this.titleID = titleID;
    if (titleID.toString().slice(0, 2) === 'tt') {
      const getIMDBMovie$ = this.vidsrcService.getIMDBMovie(titleID)
      getIMDBMovie$.subscribe({
        next: (httpResponse) => {
          this.movieExists = true;
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(httpResponse.body!, 'text/html');
          
          // const movieTitle = htmlDoc.querySelector('title')!.text;
          var iframeSource = htmlDoc.querySelector('iframe#player_iframe')!.getAttribute('src')!;
          // var movieSources = htmlDoc.querySelector('div.servers');
  
          this.movieURL = this.domSanitizer.bypassSecurityTrustResourceUrl(iframeSource);
        },
        error: (err) => {
          this.movieExists = false;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      })
  
      const getIMDBShow$ = this.vidsrcService.getIMDBShow(titleID, season, episode)
      getIMDBShow$.subscribe({
        next: (httpResponse) => {
          this.showExists = true;
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(httpResponse.body!, 'text/html');
          
          
          // const showTitle = htmlDoc.querySelector('title')!.text;
          var iframeSource = htmlDoc.querySelector('iframe#player_iframe')!.getAttribute('src')!;
          // var showSources = htmlDoc.querySelector('div.servers');
  
          this.showURL = this.domSanitizer.bypassSecurityTrustResourceUrl(iframeSource);
        },
        error: (err) => {
          this.showExists = false;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      })
    }
    else {
      const getTMDBMovie$ = this.vidsrcService.getTMDBMovie(titleID)
      getTMDBMovie$.subscribe({
        next: (httpResponse) => {
          this.movieExists = true;
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(httpResponse.body!, 'text/html');
          
          // const movieTitle = htmlDoc.querySelector('title')!.text;
          var iframeSource = htmlDoc.querySelector('iframe#player_iframe')!.getAttribute('src')!;
          // var movieSources = htmlDoc.querySelector('div.servers');
  
          this.movieURL = this.domSanitizer.bypassSecurityTrustResourceUrl(iframeSource);
        },
        error: (err) => {
          this.movieExists = false;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      })
  
      const getTMDBShow$ = this.vidsrcService.getTMDBShow(titleID, season, episode)
      getTMDBShow$.subscribe({
        next: (httpResponse) => {
          this.showExists = true;
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(httpResponse.body!, 'text/html');
          
          
          // const showTitle = htmlDoc.querySelector('title')!.text;
          var iframeSource = htmlDoc.querySelector('iframe#player_iframe')!.getAttribute('src')!;
          // var showSources = htmlDoc.querySelector('div.servers');
  
          this.showURL = this.domSanitizer.bypassSecurityTrustResourceUrl(iframeSource);

          var mediaType = this.searchResult.find(x => {
            return x.id === titleID
          }).media_type
          if (mediaType === 'tv') {
            this.loadShowSeasonsEpisodes(titleID)
          }
        },
        error: (err) => {
          this.showExists = false;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      })
    }
  }
  
  loadShowSeasonsEpisodes(titleID: string) {
    this.tmdbSeasonsEpisodes = new Map();
    const getTMDBSeasonsEpisodes$: Observable<any> = this.vidsrcService.getTMDBSeasonsEpisodes(titleID)
    getTMDBSeasonsEpisodes$.subscribe({
      next: (httpResponse) => {
        var seasons: any[] = httpResponse.seasons;
        seasons.forEach(season => {
          if (season.season_number > 0) {
            var numberOfEpisodes = [];
            for (var i = 1; i <= season.episode_count; i++) {
              numberOfEpisodes.push(i);
            }
            this.tmdbSeasonsEpisodes.set(season.season_number, numberOfEpisodes)
          }
        })
      }
    })
  }

  changeSeason(season: number) {
    this.selectedSeason = season;
    this.loadMovieShow(this.titleID, season)
  }
  changeEpisode(episode: number) {
    this.selectedEpisode = episode;
    this.loadMovieShow(this.titleID, this.selectedSeason, episode)
  }
}
