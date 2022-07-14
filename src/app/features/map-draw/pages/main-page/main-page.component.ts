import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MapService, ListService, ShapefileService } from '@core';
import { FeatureCollection, multiPolygon } from '@turf/helpers';
import * as shp from 'shpjs';
import { convertFeatureToWK, parseFromWK } from 'wkt-parser-helper';
import * as L from 'leaflet';
import { Observable } from 'rxjs';
import { waitForAsync } from '@angular/core/testing';
import { ResultsComponent } from 'shared/components/results/results.component';





@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {


  p: number = 1;
  flag: any;


  constructor(public mapService: MapService, public api: ListService,
    public shapeService: ShapefileService, public results: ResultsComponent) { }

  ngOnInit(): void {

    this.inputPage(this.p)
  }

  inputPage(number: number) {
    if (number == 1) {
      this.p = 1;
      return this.api.getServices(this.p).subscribe(data => this.results.results = data);
    } else {
      this.p = 17;
      return this.api.getServices(this.p).subscribe(data => this.results.results = data);
    }

  }




  searchServices() {
    this.mapService.wktPolygon = "POLYGON ((-9.166718 38.760058, -9.127579 38.718843, -9.185944 38.703314, -9.166718 38.760058))"
   
    return this.api.getServicesByPolygon(this.p,this.mapService.wktPolygon).subscribe(data => console.log(this.results.results = data));
    //.subscribe(data => this.results.results = data);
    

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
