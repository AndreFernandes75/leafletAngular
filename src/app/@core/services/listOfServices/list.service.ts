import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  constructor() { 
    return fetch('https://request-service.services4eo.com/api/v1/services', {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-API-KEY':'8c29db56-2cd0-4fa4-b9d6-84c2f15749c6'
          },
    })
      .then((response) => {
          return response.json()
        })
      .then((json) => {
        
        return json;
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
