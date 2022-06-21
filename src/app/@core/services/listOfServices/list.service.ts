import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  constructor(private http: HttpClient) { }

  apiUrl = "https://request-service.services4eo.com/api/v1/services"

  getServices() {
    return new Promise(resolve => {
      this.http.get(this.apiUrl, { headers: new HttpHeaders().set("X-API-KEY", "8c29db56-2cd0-4fa4-b9d6-84c2f15749c6") }).subscribe(data => {
        resolve(data);
      }, err => {
        console.log(err);
      });
    });
    
  }



}
