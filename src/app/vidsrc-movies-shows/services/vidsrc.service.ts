import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VidsrcService {

  constructor(private http: HttpClient) { }

  private _VIDSRC_API_URL = 'https://vidsrcme.vidsrc.icu/embed'

  private _MOVIE_ENDPOINT = `${this._VIDSRC_API_URL}/movie?imdb=`
  private _SHOW_ENDPOINT = `${this._VIDSRC_API_URL}/tv?imdb=`

  private _httpOptions = {
    responseType: 'text' as const,
    observe: 'response' as const,
  };

  getVidSrcMovie(imdbID: string): Observable<HttpResponse<string>> {
    return this.http.get(`${this._MOVIE_ENDPOINT}${imdbID}`, this._httpOptions)
  }

  getVidSrcShow(imdbID: string, season: number = 1, episode: number = 1): Observable<HttpResponse<string>> {
    console.log(`${this._SHOW_ENDPOINT}${imdbID}`)
    return this.http.get(`${this._SHOW_ENDPOINT}${imdbID}&season=${season}&episode=${episode}`, this._httpOptions)
  }
  
}
