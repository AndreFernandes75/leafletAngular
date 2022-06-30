import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MapService, ListService, ShapefileService } from '@core';
import { FeatureCollection } from '@turf/helpers';
import { geoJSON } from 'leaflet';
import * as shp from 'shpjs';
import { convertFeatureToWK, parseFromWK } from 'wkt-parser-helper';
import * as L from 'leaflet';
import { FormControl } from '@angular/forms';


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
  form = new FormControl('');


  constructor(public mapService: MapService, public api: ListService, public shapeService: ShapefileService) { }

  ngOnInit(): void {
    this.api.getServices().subscribe(data => this.results = data)

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
              const input = (<HTMLInputElement>document.getElementById('shapefile'))
              this.form.setValue(convertFeatureToWK(event.propagatedFrom.feature));
            });
            
            featuresGroup.setStyle({
              color: '#052d74'
            });
            layer.setStyle({ color: '#f47d08' });
            featuresGroup.addLayer(layer);
          });
          
          console.log(featuresGroup)
          this.mapService.populateMapWithFeatureGroup(featuresGroup)
        })
      });
    }
  }






}
