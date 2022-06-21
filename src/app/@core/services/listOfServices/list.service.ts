import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})


export class ListService {

  constructor(private http: HttpClient) { }

  apiUrl = "https://request-service.services4eo.com/api/v1/services"

  httpOptions = {
    headers: new HttpHeaders({
      Accept: 'application/json',
      'Content-type': 'application/json',
      'X-API-KEY': '8c29db56-2cd0-4fa4-b9d6-84c2f15749c6'
    })
  }

  getServices(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.httpOptions.headers })
    
  }


}
