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
    this.hasSearched = true;
    this.isLoading = true;
    
    if (value.slice(0, 2) === 'tt') {
      this.search$ = this.vidsrcService.getIMDBMovie(value)
      this.search$.subscribe({
        next: (httpResponse) => {
          this.movieExists = true;
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(httpResponse.body!, 'text/html');
          
          const movieTitle = htmlDoc.querySelector('title')!.text;
          console.log(movieTitle)
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
          
          
          const showTitle = htmlDoc.querySelector('title')!.text;
          console.log(showTitle)
          var iframeSource = htmlDoc.querySelector('iframe#player_iframe')!.getAttribute('src')!;
          console.log(iframeSource)
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
          
          const movieTitle = htmlDoc.querySelector('title')!.text;
          console.log(movieTitle)
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
          
          
          const showTitle = htmlDoc.querySelector('title')!.text;
          console.log(showTitle)
          var iframeSource = htmlDoc.querySelector('iframe#player_iframe')!.getAttribute('src')!;
          console.log(iframeSource)
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
