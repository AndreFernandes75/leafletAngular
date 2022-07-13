import { Component, OnInit } from '@angular/core'

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
  nextPage: number
  services: Array<Service>
}

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent {

  public results!:Results;

}
