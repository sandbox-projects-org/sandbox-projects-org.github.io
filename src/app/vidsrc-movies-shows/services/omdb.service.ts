import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OmdbService {

  private _OMDB_API_URL = 'http://www.omdbapi.com'

  constructor(private http: HttpClient) { }

  options: object = {
    observe: 'response',
    params: {
      apikey: '50466990'
    }
  }

  getMediaInfo(title: string)  {
    return this.http.get<any>(`${this._OMDB_API_URL}/?s=${title}`, this.options).pipe(
      map(response => response.body.Search)
    )
  }
}
