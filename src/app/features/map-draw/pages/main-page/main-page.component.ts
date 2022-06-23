import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MapService, ListService } from '@core';



type Service = {
  category: string
  created: string
  description: string
  documentationURI: string
  identifier: string
  keywords: Array<string>
  lastUpdate: string
  sampleURI: Array<string>
  serviceFootprint: string
  serviceGroups: null
  serviceInput: {}
  servicePeriod: {}
  serviceProvider: {}
  serviceSubtype: string
  serviceType: string
  serviceURI: string
  title: string
}

type Results = {
  totalResults: number
  itemsPerPage: number
  services: Array<Service>
}




@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  results!: Results;



  constructor(public mapService: MapService, public api: ListService) { }

  ngOnInit(): void {
    this.api.getServices().subscribe(data => this.results = data)
  
  }






}
