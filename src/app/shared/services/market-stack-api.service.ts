import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MarketStackApiService {

  constructor(private http: HttpClient) { }

  // free api limited to 100 requests per month
  getBasicEndOfDayDataObservable(symbol: string) {
    return this.http.get(`https://api.marketstack.com/v1/eod?symbols=${symbol}&access_key=7fba8791cf1ee740154a853af7f08245`);
  }
}
