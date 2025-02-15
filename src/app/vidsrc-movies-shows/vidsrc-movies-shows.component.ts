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
  movieURL: any = '';
  showURL: any = '';


  searchResult: any[] = [];

  hasSearched = false;
  movieExists = false;
  showExists = false;
  isLoading = false;

  search$: Observable<any>;

  constructor(
    private vidsrcService: VidsrcService,
    private domSanitizer: DomSanitizer
  ){
    this.search$ = new Observable();
  }

  searchMovieShow(value: string) {
    this.searchResult = [];

    // seach directly for movie if value is IMDB id or TMDB id
    if (value.slice(0, 5) === 'imdb:' || value.slice(0, 5) === 'tmdb:') {
      this.loadMovieShow(value.slice(5));
    }

    // search TMDB catalog
    else {
    this.search$ = this.vidsrcService.searchTMDB(value)
    this.search$.subscribe({
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

  loadMovieShow(value: string) {
    this.hasSearched = true;
    this.isLoading = true;
    if (value.toString().slice(0, 2) === 'tt') {
      this.search$ = this.vidsrcService.getIMDBMovie(value)
      this.search$.subscribe({
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
  
      const vidsrcShow$ = this.vidsrcService.getIMDBShow(value)
      vidsrcShow$.subscribe({
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
      this.search$ = this.vidsrcService.getTMDBMovie(value)
      this.search$.subscribe({
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
  
      const vidsrcShow$ = this.vidsrcService.getTMDBShow(value)
      vidsrcShow$.subscribe({
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
  }
  
}
