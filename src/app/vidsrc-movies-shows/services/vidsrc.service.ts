import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VidsrcService {

  constructor(private http: HttpClient) { }

  private _VIDSRC_API_URL = 'https://vidsrcme.vidsrc.icu/embed'

  private _IMDB_MOVIE_ENDPOINT = `${this._VIDSRC_API_URL}/movie?imdb=`
  private _IMDB_SHOW_ENDPOINT = `${this._VIDSRC_API_URL}/tv?imdb=`

   private _TMDB_MOVIE_ENDPOINT = `${this._VIDSRC_API_URL}/movie?tmdb=`
  private _TMDB_SHOW_ENDPOINT = `${this._VIDSRC_API_URL}/tv?tmdb=`

  private _httpOptions = {
    responseType: 'text' as const,
    observe: 'response' as const,
  };

  getIMDBMovie(imdbID: string): Observable<HttpResponse<string>> {
    return this.http.get(`${this._IMDB_MOVIE_ENDPOINT}${imdbID}`, this._httpOptions)
  }

  getIMDBShow(imdbID: string, season: number = 1, episode: number = 1): Observable<HttpResponse<string>> {
    return this.http.get(`${this._IMDB_SHOW_ENDPOINT}${imdbID}&season=${season}&episode=${episode}`, this._httpOptions)
  }

  getTMDBMovie(tmdbID: string): Observable<HttpResponse<string>> {
    return this.http.get(`${this._TMDB_MOVIE_ENDPOINT}${tmdbID}`, this._httpOptions)
  }

  getTMDBShow(tmdbID: string, season: number = 1, episode: number = 1): Observable<HttpResponse<string>> {
    return this.http.get(`${this._TMDB_SHOW_ENDPOINT}${tmdbID}&season=${season}&episode=${episode}`, this._httpOptions)
  }
  
}
