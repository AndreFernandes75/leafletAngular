import { Component, Input } from '@angular/core';
import { MapService } from '@core';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
  

  constructor(public mapService:MapService ) { }

  



}
