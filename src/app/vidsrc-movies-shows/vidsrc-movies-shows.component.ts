import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-vidsrc-movies-shows',
  standalone: true,
  imports: [],
  templateUrl: './vidsrc-movies-shows.component.html',
  styleUrl: './vidsrc-movies-shows.component.scss'
})
export class VidsrcMoviesShowsComponent{
  movieURL: any = '';
  showURL: any = '';

  constructor(
    private domSanitizer: DomSanitizer
  ){}

  searchMovieShow(value: string) {
    this.movieURL = this.domSanitizer.bypassSecurityTrustResourceUrl(`https://vidsrcme.vidsrc.icu/embed/movie?imdb=${value}&autoplay=1`)
    this.showURL = this.domSanitizer.bypassSecurityTrustResourceUrl(`https://vidsrcme.vidsrc.icu/embed/tv?imdb=${value}&autoplay=1`)
  }
  
}
