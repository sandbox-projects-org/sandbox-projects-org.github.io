import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VidsrcService {

   // Has no ads
   private _VIDSRC_API_URL = '/VIDSRCME_VIDSRC_ICU_BASE_URL'

   // Has ads
   // private _VIDSRC_API_URL = '/VIDSRC_ME_BASE_URL'

  private _IMDB_MOVIE_ENDPOINT = `${this._VIDSRC_API_URL}/embed/movie?imdb=`
  private _IMDB_SHOW_ENDPOINT = `${this._VIDSRC_API_URL}/embed/tv?imdb=`

   private _TMDB_MOVIE_ENDPOINT = `${this._VIDSRC_API_URL}/embed/movie?tmdb=`
  private _TMDB_SHOW_ENDPOINT = `${this._VIDSRC_API_URL}/embed/tv?tmdb=`

  private _httpOptions = {
    responseType: 'text' as const,
    observe: 'response' as const,
  };

  private _TMDB_Search_Options ={
    headers: {
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjIzNjlmZTRjOWU0NmUyZjk3YjExM2ZkODM2ZWZkOSIsIm5iZiI6MTcwMTI5NDQzMC40NzksInN1YiI6IjY1NjdiMTVlNmMwYjM2MDBhZTUwNGI4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w9CbNfyRS54DMDwag6-YcAmGjVqbi3KZj1S3UdelaPw'
    }
  }

  constructor(private http: HttpClient) { }

  getIMDBMovie(imdbID: string): Observable<HttpResponse<string>> {
    return this.http.get(`${this._IMDB_MOVIE_ENDPOINT}${imdbID}`, this._httpOptions)
  }

  getIMDBShow(imdbID: string, season: number = 1, episode: number = 1): Observable<HttpResponse<string>> {
    return this.http.get(`${this._IMDB_SHOW_ENDPOINT}${imdbID}&season=${season}&episode=${episode}`, this._httpOptions)
  }

  getTMDBMovie(tmdbID: string): Observable<HttpResponse<string>> {
    return this.http.get(`${this._TMDB_MOVIE_ENDPOINT}${tmdbID}`, this._httpOptions)
  }

  getTMDBShow(tmdbID: string, season: number, episode: number): Observable<HttpResponse<string>> {
    return this.http.get(`${this._TMDB_SHOW_ENDPOINT}${tmdbID}&season=${season}&episode=${episode}`, this._httpOptions)
  }
}