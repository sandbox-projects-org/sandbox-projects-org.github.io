import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  
  public TMDB_POSTER_PATH_URL = 'https://image.tmdb.org/t/p/w500'
  private _TMDB_API_URL = 'https://api.themoviedb.org/3';

  private _TMDB_SEARCH_MOVIE_ENDPOINT = `${this._TMDB_API_URL}/search/movie`;
  private _TMDB_SEARCH_TV_ENDPOINT = `${this._TMDB_API_URL}/search/tv`;
  private _TMDB_SEARCH_MULTI_ENDPOINT = `${this._TMDB_API_URL}/search/multi`;
  private _TMDB_MOVIE_DETAILS_ENDPOINT = `${this._TMDB_API_URL}/movie`;
  private _TMDB_TV_DETAILS_ENDPOINT = `${this._TMDB_API_URL}/tv`;
  private _TMDB_FIND_BY_IMDB_ID_ENDPOINT = `${this._TMDB_API_URL}/find`;


  private _httpOptions: object = {
    headers: {
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjIzNjlmZTRjOWU0NmUyZjk3YjExM2ZkODM2ZWZkOSIsIm5iZiI6MTcwMTI5NDQzMC40NzksInN1YiI6IjY1NjdiMTVlNmMwYjM2MDBhZTUwNGI4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.w9CbNfyRS54DMDwag6-YcAmGjVqbi3KZj1S3UdelaPw'
    },
    observe: 'response'
  }

  private _httpSearchOptions: object = Object.defineProperty(structuredClone(this._httpOptions), 'params', {value: {include_adult: 'true'}});
  private _httpFindByIMDBOptions: object = Object.defineProperty(structuredClone(this._httpOptions), 'params', {value: {external_source: 'imdb_id'}});


  constructor(private http: HttpClient) {}

  getMovies(title: string) {
    return this.http.get<any>(`${this._TMDB_SEARCH_MOVIE_ENDPOINT}?query=${title}`, this._httpSearchOptions).pipe(
      map(x => x.body)
    )
  }

  getShows(title: string) {
    return this.http.get<any>(`${this._TMDB_SEARCH_TV_ENDPOINT}?query=${title}`, this._httpSearchOptions).pipe(
      map(x => x.body)
    )
  }

  getMoviesShows(title: string) {
    return this.http.get<any>(`${this._TMDB_SEARCH_MULTI_ENDPOINT}?query=${title}`, this._httpSearchOptions).pipe(
      map(x => x.body)
    )
  }

  getMovieImdbId(tmdbID: string) {
    return this.http.get<any>(`${this._TMDB_MOVIE_DETAILS_ENDPOINT}/${tmdbID}/external_ids`, this._httpOptions).pipe(
      map(x => x.body.imdb_id)
    )
  }

  getShowImdbId(tmdbID: number) {
    return this.http.get<any>(`${this._TMDB_TV_DETAILS_ENDPOINT}/${tmdbID}/external_ids`, this._httpOptions).pipe(
      map(x => x.body.imdb_id)
    )
  }

  getShowSeasonsEpisodes(tmdbID: string) {
    return this.http.get<any>(`${this._TMDB_TV_DETAILS_ENDPOINT}/${tmdbID}`, this._httpOptions).pipe(
      map(response => response.body.seasons.filter((season: { season_number: number; }) => season.season_number > 0)),
    )
  }

  getMovieDetails(tmdbID: string) {
    return this.http.get<any>(`${this._TMDB_MOVIE_DETAILS_ENDPOINT}/${tmdbID}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }

  getEpisodeDetails(tmdbID: string, season: number, episode: number) {
    return this.http.get<any>(`${this._TMDB_TV_DETAILS_ENDPOINT}/${tmdbID}/season/${season}/episode/${episode}`, this._httpOptions).pipe(
      map(x => x.body)
    )
  }

  getTmdbIdFromImdbId(imdbID: string) {
    return this.http.get<any>(`${this._TMDB_FIND_BY_IMDB_ID_ENDPOINT}/${imdbID}`, this._httpFindByIMDBOptions).pipe(
      map(x => x.body)
    )
  }
}
