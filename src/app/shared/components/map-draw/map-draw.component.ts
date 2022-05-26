import { Component, Input, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-draw',
  templateUrl: './map-draw.component.html',
  styleUrls: ['./map-draw.component.css'],
  styles:[':host {margin-top: 300px;}']

})
export class MapDrawComponent implements OnInit{
 
  @Input() id!: string;
  map!: L.Map;

  

  ngOnInit(): void {
    this.map = L.map('map', { editable: true }).setView([38.72726949553772, -9.13994942204751], 13);

    //ADDING LEAFLET TO THE MAP
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

  
  }

}
