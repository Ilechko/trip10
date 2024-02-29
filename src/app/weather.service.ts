// weather.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = 'NZWHGBSSPCP6ZGQRABN478UQM';
  private apiUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';


  constructor(private http: HttpClient) { }

  getCurrentWeather(cityName: string): Observable<any> {
    const url = `${this.apiUrl}${cityName}/today?unitGroup=metric&include=days&key=${this.apiKey}&contentType=json`;
    return this.http.get<any>(url);
  }
}
