import { Component, Injectable, Output, EventEmitter, ApplicationModule } from '@angular/core';
import * as turf from '@turf/turf'
import * as L from 'leaflet';
import 'leaflet-draw';
// import 'leaflet-editable';
import { on } from 'events';
import { convertToWK, parseFromWK } from 'wkt-parser-helper';
import * as shp from 'shpjs';
import { AsyncSubject, BehaviorSubject, map, Observable, ObservableInput, throwError } from 'rxjs';
import { ListService } from '../listOfServices/list.service';
import { threadId } from 'worker_threads';
import { HttpClient } from '@angular/common/http';
import { rejects } from 'assert';
import { waitForAsync } from '@angular/core/testing';



export { ZERO_OPACITY, HALF_OPACITY };

type DrawingLayer =
  | { wkt: string; layer: L.Polygon | L.Polyline | L.Marker; type: string }
  | null;



const ZERO_OPACITY = 0;
const HALF_OPACITY = 0.5;


@Injectable({
  providedIn: 'root'
})

export class MapService {

  public drawingLayer$: BehaviorSubject<DrawingLayer>;

  constructor(public api: ListService, private http: HttpClient) { this.drawingLayer$ = new BehaviorSubject<DrawingLayer>(null) }





  namesOfBaseMaps = {
    'Google Maps': L.tileLayer(
      'https://mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      {
        id: 'googleMaps',

      }

    ),
    'Google Terrain Hybrid': L.tileLayer(
      'https://mt.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      {
        id: 'googleTerrainHybrid',
      }
    ),
    'Google Satellite': L.tileLayer(
      'https://mt.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      {
        id: 'googleSatellite',
      }
    ),
    'Google Satellite Hybrid': L.tileLayer(
      'https://mt.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        id: 'googleSatelliteHybrid',
      }
    ),
    'Wikimedia Map': L.tileLayer(
      'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
      {
        id: 'wikimediaMap',
        attribution: 'OpenStreetMap contributors, under ODbL',
      }
    ),
    'Esri Ocean': L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      {
        id: 'EsriOcean',
        attribution: '',
      }
    ),
    'Esri Satellite': L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        id: 'EsriSatellite',
        attribution: '',
      }
    ),
    'Esri Topo World': L.tileLayer(
      'http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        id: 'EsriTopoWorld',
        attribution: '',
      }
    ),
    'OpenStreetMap Standard': L.tileLayer(
      'http://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        id: 'OpenStreetMapStandard',
        attribution: 'OpenStreetMap contributors, CC-BY-SA',
      }
    ),
  };


  public map!: L.DrawMap;
  public coordinates: any;
  private circleArea?: any;
  private polygonArea?: any;
  private markerArea?: any;
  title = 'leafletAngular';
  private populatedLayer?: L.GeoJSON;
  private shapeLayer?: L.GeoJSON;
  private shapeFileLayerGroup!: L.FeatureGroup;
  public observableDraw: any;
  public page: number = 1;
  public value: any;





  //FUNCTION THAT INITIALIZE THE MAP
  public initializeMap(
    divId: string,
    center: [number, number],
    initialZoom: number
  ): void {
    const southWest = L.latLng(-89.98155760646617, -180),
      northEast = L.latLng(89.99346179538875, 180);
    const bounds = L.latLngBounds(southWest, northEast);

    this.map = L.map(divId, {
      maxBounds: bounds,
      attributionControl: false,
      minZoom: 3,
      zoomControl: false,
      maxBoundsViscosity: 1.0,
    });
    let drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);
    let drawControl = new L.Control.Draw({
      draw: {
        polygon: false,
        marker: false,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
      },
      edit: {
        edit: false,
        remove: false,
        featureGroup: drawnItems,
      },


    });

    this.map.addControl(drawControl);
    this.map.setView(center, initialZoom);
    L.control.layers(this.namesOfBaseMaps).addTo(this.map);
    this.namesOfBaseMaps['Google Maps'].addTo(this.map);


  }

  //FUNCTION THAT OBSERVE THE WKT  
  observeDrawingLayer(
    layer: L.Polygon | L.Polyline | L.Marker,
    type: string,
    page: number,

  ) {
    const wkt: string = convertToWK(layer.toGeoJSON());
    if (wkt) this.drawingLayer$.next({ wkt, layer, type })
  }

  //FUNCTION THAT CLEAR EVERY DRAWS
  public clearMap(): void {

    if (this.polygonArea) {
      this.map.removeLayer(this.polygonArea);
      document.getElementById("coor")!.innerHTML = ""
    }
    if (this.markerArea) {
      this.map.removeLayer(this.markerArea);
      document.getElementById("coor")!.innerHTML = ""
    }
    if (this.circleArea) {
      this.map.removeLayer(this.circleArea)
      document.getElementById("coor")!.innerHTML = ""
    }
    if (this.shapeFileLayerGroup) {
      this.map.removeLayer(this.shapeFileLayerGroup);
      this.shapeFileLayerGroup.clearLayers();
    }
  }



  drawPolygon() {

    this.clearMap()
    let polygonDrawer = new L.Draw.Polygon(this.map).enable();
    this.polygonArea = new L.FeatureGroup();
    let editableLayers = this.polygonArea;
    this.map.addLayer(editableLayers);



    this.map.addEventListener(L.Draw.Event.CREATED, (e: any) => {
      let type = (e as L.DrawEvents.Created).layerType,
        layer = e.layer;
      editableLayers.addLayer(layer)

      if (type == "polygon") {
        let coord = layer.getBounds().getCenter();
        document.getElementById("coor")!.innerHTML = coord.toString();
        this.value = this.observeDrawingLayer(layer, type, this.page);
        layer.editing.enable()
        //WARNING -> Deprecated use of _flat, please use L.LineUtil.isFlat instead. -> BUG WITH DRAW LIBRARY
      }


    });


  }

  pinMarker() {

    this.clearMap();
    let markerDrawer = new L.Draw.Marker(this.map).enable();
    this.markerArea = new L.FeatureGroup();
    let editableLayers = this.markerArea;
    this.map.addLayer(editableLayers);

    this.map.addEventListener(L.Draw.Event.CREATED, (e: any) => {
      let type = (e as L.DrawEvents.Created).layerType,
        layer = e.layer;
      editableLayers.addLayer(layer);
      

      if (type == "marker") {

        let coord = layer._latlng;
        document.getElementById("coor")!.innerHTML = coord.toString();
        this.value = this.observeDrawingLayer(layer, type, this.page);
        
        layer.editing.enable() 
        //ERROR -> Cannot read properties of undefined (reading 'enable')->BUG WITH DRAW LIBRARY

      

      }
      
    });

    

  }




  drawCircle() {

    this.clearMap();
    let circleDrawer = new L.Draw.Circle(this.map).enable();
    this.circleArea = new L.FeatureGroup();
    let editableLayers = this.circleArea;
    this.map.addLayer(editableLayers);

    this.map.addEventListener(L.Draw.Event.CREATED, (e: any) => {
      let type = (e as L.DrawEvents.Created).layerType,
        layer = e.layer;
      editableLayers.addLayer(layer);

      if (type == "circle") {

        let coord = layer._latlng;
        document.getElementById("coor")!.innerHTML = coord.toString();
        this.value = this.observeDrawingLayer(layer, type, this.page);
        

      }

    })


  }


  toJson(item: string) {
    const geojson = parseFromWK(item);
    return geojson;
  }

  inWkt(geojson: GeoJSON.GeoJSON) {
    const wkt = convertToWK(geojson);
    return wkt;
  }

  public async populateMap(
    geoJSON: GeoJSON.GeoJSON,
    color?: string,
    clear: boolean = true
  ) {
    clear ? this.clearMap() : null;
    let lineOptions: L.PolylineOptions = {
      color: color ? color : '#ff0000',
      lineJoin: 'round',
    };
    if (geoJSON && this.map) {
      this.populatedLayer = L.geoJSON(undefined, lineOptions).addTo(
        this.map as L.Map
      );

      this.populatedLayer?.addData(geoJSON);
      this.populatedLayer?.getLayers().map((layer) => {
        switch (geoJSON.type) {
          case 'MultiPolygon':
            this.polygonArea = layer as L.Polygon;

            if (this.polygonArea.getCenter().lat == 0) {
              this.map.setView([0, 0], 2)
            } else {
              this.map.setView(this.polygonArea.getCenter(), 6)
            }
            break;
        }
      });
    }


  }



  loadFile() {
    document.getElementById('shapefile')!.onchange = async function (e: Event) {
      let file = (<HTMLInputElement>e.target).files![0];
      console.log(file)
      switch (file.name.slice(-3)) {
        case 'zip':
          console.log(".zip")
          const buffer = await new Response(file).arrayBuffer()
          console.log(buffer)
          const geojson = await shp(buffer);
          console.log("geojson:" + geojson);
          return geojson;
          break;

        default:
          return console.log(file.name.slice(-3))
          break;
      }
    }
  }

  public populateMapWithFeatureGroup(featureGroup: L.FeatureGroup) {
    this.clearMap();
    this.shapeFileLayerGroup = new L.FeatureGroup([featureGroup]).addTo(
      this.map
    );
    this.map.fitBounds(featureGroup.getBounds())
  }




}


