import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OmdbService {

  private _OMDB_API_URL = 'http://www.omdbapi.com'

  private _httpOptions: object = {
    observe: 'response',
    params: {
      apikey: '50466990'
    }
  }

  constructor(private http: HttpClient) { }

  getSearch(title: string): Observable<object[]>  {
    return this.http.get<any>(`${this._OMDB_API_URL}/?s=${title}`, this._httpOptions).pipe(
      map(response => response.body)
    )
  }

  getIMDBInfo(imdbID: string) {
    return this.http.get<any>(`${this._OMDB_API_URL}/?i=${imdbID}`, this._httpOptions).pipe(
      map(response => response.body)
    )
  }
}
