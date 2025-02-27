import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  
  public TMDB_POSTER_PATH_URL = 'https://image.tmdb.org/t/p/w500'
  private _TMDB_API_URL = 'https://api.themoviedb.org/3';

  private _TMDB_SEARCH_MULTI_ENDPOINT = `${this._TMDB_API_URL}/search/multi`;
  private _TMDB_TV_DETAILS_ENDPOINT = `${this._TMDB_API_URL}/tv`;


  private _httpOptions: object = {
    headers: {
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjIzNjlmZTRjOWU0NmUyZjk3YjExM2ZkODM2ZWZkOSIsIm5iZiI6MTcwMTI5NDQzMC40NzksInN1YiI6IjY1NjdiMTVlNmMwYjM2MDBhZTUwNGI4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w9CbNfyRS54DMDwag6-YcAmGjVqbi3KZj1S3UdelaPw'
    },
    observe: 'response'
  }

  private _httpSearchOptions: object = Object.defineProperty(structuredClone(this._httpOptions), 'params', {value: {include_adult: 'true'}});
  private _httpFindByIMDBOptions: object = Object.defineProperty(structuredClone(this._httpOptions), 'params', {value: {external_source: 'imdb_id'}});


  constructor(private http: HttpClient) {}

  getMoviesShows(title: string, page: number) {
    return this.http.get<any>(`${this._TMDB_SEARCH_MULTI_ENDPOINT}?query=${title}&page=${page}`, this._httpSearchOptions).pipe(
      map(x => x.body)
    )
  }

  getShowDetails(tmdbID: string) {
    return this.http.get<any>(`${this._TMDB_TV_DETAILS_ENDPOINT}/${tmdbID}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }

  getSeasonDetails(tmdbID: string, season: number) {
    return this.http.get<any>(`${this._TMDB_TV_DETAILS_ENDPOINT}/${tmdbID}/season/${season}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }

  getEpisodeDetails(tmdbID: string, season: number, episode: number) {
    return this.http.get<any>(`${this._TMDB_TV_DETAILS_ENDPOINT}/${tmdbID}/season/${season}/episode/${episode}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }

  // getTmdbIdFromImdbId(imdbID: string) {
  //   return this.http.get<any>(`${this._TMDB_FIND_BY_IMDB_ID_ENDPOINT}/${imdbID}`, this._httpFindByIMDBOptions).pipe(
  //     map(x => x.body)
  //   )
  // }
}
