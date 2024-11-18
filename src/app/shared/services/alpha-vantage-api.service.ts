import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlphaVantageApiService {
  constructor(private http: HttpClient) { }

  // free api limited to 25 requests per day
  getTimeSeriesDailyObservable(symbol: string) {
    return this.http.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=H1DKB32IBHN6GN9S`);
  }
}
