import { Component, Input, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from '@core';

@Component({
  selector: 'app-map-draw',
  templateUrl: './map-draw.component.html',
  styleUrls: ['./map-draw.component.css'],
  styles:[':host {margin-top: 300px;}']

})
export class MapDrawComponent implements OnInit{

  constructor(public mapService:MapService ) { }
 
  @Input() id!: string;


  ngOnInit(): void {
  this.mapService.initializeMap('map',[38.72726949553772,-9.13994942204751],11);

  }


}
