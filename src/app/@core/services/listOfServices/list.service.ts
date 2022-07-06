import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MultiPolygon } from '@turf/helpers';


@Injectable({
  providedIn: 'root'
})


export class ListService {

  constructor(private http: HttpClient) { }

  apiUrl = "https://request-service.services4eo.com/api/v1/services"

  httpOptions = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
      'X-API-KEY': '8c29db56-2cd0-4fa4-b9d6-84c2f15749c6'
    })
  }

  getServices(page: number): Observable<any> {
    return this.http.get(this.apiUrl + '?perPage=16' + '&page=' + page, { headers: this.httpOptions.headers });
  }

  getServicesByPolygon(page: number, multi: MultiPolygon): Observable<any> {
    return this.http.get(this.apiUrl + '?perPage=16' + '&page=' + page + '&aoi=' + multi, { headers: this.httpOptions.headers });
  }


}
