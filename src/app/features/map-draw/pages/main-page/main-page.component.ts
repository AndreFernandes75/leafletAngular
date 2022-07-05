import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MapService, ListService, ShapefileService, SearchService } from '@core';
import { FeatureCollection } from '@turf/helpers';
import { geoJSON } from 'leaflet';
import * as shp from 'shpjs';
import { convertFeatureToWK, parseFromWK } from 'wkt-parser-helper';
import * as L from 'leaflet';



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
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  results!: Results;
  p: number = 1;


  constructor(public mapService: MapService, public api: ListService,
    public shapeService: ShapefileService, public searchService: SearchService) { }

  ngOnInit(): void {
    this.inputPage(this.p)
  }

  inputPage(number: number) {
    if (number == 1) {
      this.p = 1;
      return this.api.getServices(this.p).subscribe(data => this.results = data);
    } else {
      this.p = 17;
      return this.api.getServices(this.p).subscribe(data => this.results = data);
    }
    console.log(this.p)
  }

  onInput(event: Event) {
    let files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      this.mapService.clearMap();
      this.shapeService.readFileContent(files[0]).subscribe((file) => {
        shp(file as string).then((geoJSON) => {
          this.mapService.clearMap();
          let collection = geoJSON as shp.FeatureCollectionWithFilename[];
          let features = collection[0].features;
          let featuresGroup = new L.FeatureGroup();

          features.map((feature, index) => {

            let wkt = convertFeatureToWK(feature);
            let aoi = parseFromWK(wkt) as GeoJSON.GeoJSON;
            let layer = L.geoJSON();


            layer.addData(aoi).on('click', (event) => {

              featuresGroup.setStyle({ color: '#3073F1' });
              this.mapService.coordinates = layer.getBounds().getCenter();
              layer.setStyle({ color: '#f47d08' });

            });

            featuresGroup.setStyle({ color: '#3073F1' });
            layer.setStyle({ color: '#f47d08' });
            featuresGroup.addLayer(layer);

          });

          this.mapService.populateMapWithFeatureGroup(featuresGroup)
        })
      });
    }
  }

  public findService(action: any) {
    console.log(this.mapService.coordinates)
    console.log(action)
  }

}
