import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ShapefileService {

  constructor() { }

  readFileContent(file:File){
    let fileReader: FileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    return new Observable ((observer)=>{
      fileReader.onloadend = () => {
        observer.next(fileReader.result);
        observer.complete();
      };
    });
  }
}
