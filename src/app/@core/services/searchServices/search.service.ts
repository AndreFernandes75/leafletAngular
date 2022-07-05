import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }

  page1Url = "https://request-service.services4eo.com/api/v1/services?perPage=16&page=17"
  page2Url = "https://request-service.services4eo.com/api/v1/services?perPage=16&page=1"

  httpOptions={
    headers: new HttpHeaders({
      'Content-type': 'application/json',
      'X-API-KEY': '8c29db56-2cd0-4fa4-b9d6-84c2f15749c6'
    })
  }

  searchServices(): Observable<any> {
    return this.http.get(this.page1Url, { headers: this.httpOptions.headers })

  }
}
