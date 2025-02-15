import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularMaterialModule } from '../shared/modules/angular-material.module';
import { VidsrcService } from './services/vidsrc.service';

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

  constructor(
    private vidsrcService: VidsrcService,
    private domSanitizer: DomSanitizer
  ){}

  searchMovieShow(value: string) {
    this.hasSearched = true;
    const vidsrcMovie$ = this.vidsrcService.getVidSrcMovie(value)
    vidsrcMovie$.subscribe({
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
      }
    })
    console.log(this.movieExists)

    const vidsrcShow$ = this.vidsrcService.getVidSrcShow(value)
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
      }
    })
  }
  
}
