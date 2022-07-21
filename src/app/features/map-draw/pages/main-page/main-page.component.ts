import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MapService, ListService, ShapefileService } from '@core';
import { FeatureCollection, multiPolygon } from '@turf/helpers';
import * as shp from 'shpjs';
import { convertFeatureToWK, parseFromWK } from 'wkt-parser-helper';
import * as L from 'leaflet';
import { Observable, from, takeUntil, take } from 'rxjs';
import { ResultsComponent } from 'shared/components/results/results.component';
import { data } from 'jquery';





@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {


  page: number = 1;
  flag: any;


  constructor(public mapService: MapService, public api: ListService,
    public shapeService: ShapefileService, public results: ResultsComponent) { }

  ngOnInit(): void {

    this.inputPage(this.page)

    this.mapService.drawingLayer$.subscribe(data => {
      if (data) this.api.getServicesByPolygon(this.page, data.wkt).pipe(take(1)).subscribe(data => this.results.results = data)

    })




  }

  inputPage(number: number) {
    if (number == 1) {
      this.page = 1;
      return this.api.getServices(this.page).subscribe(data => this.results.results = data);
    } else {
      this.page = 17;
      return this.api.getServices(this.page).subscribe(data => this.results.results = data);
    }

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

  }

}
