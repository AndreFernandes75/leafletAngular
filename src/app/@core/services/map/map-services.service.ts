import { Component, Injectable } from '@angular/core';


import * as L from 'leaflet';
import 'leaflet-editable';
import 'leaflet';
import { on } from 'events';


export { ZERO_OPACITY, HALF_OPACITY, DRAWING_COMMIT };



const ZERO_OPACITY = 0;
const HALF_OPACITY = 0.5;
const DRAWING_COMMIT = 'editable:drawing:commit';


@Injectable({
  providedIn: 'root'
})

export class MapService {

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

  private map!: L.Map;
  public drawOptions: any;
  public coordinates: any;
  private polygonArea?: L.Polygon;
  private circleArea?: L.Circle;
  title = 'leafletAngular';
  private markerArea?: L.Marker;
  public pointMarker: any;
  public getPoint: boolean = false;
  public scale?: number;

  public removePointMarker() {
    if (this.pointMarker !== undefined) {
      this.map.removeLayer(this.pointMarker);
      this.pointMarker = undefined;
    }
  }

  public lineOptions: L.PolylineOptions =
    {
      color: '#ff0000', lineJoin: 'round',
    };

  private markerIcon = L.icon({
    iconUrl: 'assets/marker.svg',
    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62], // the same for the shadow
    popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
  });

  public markerOptions: L.MarkerOptions = {
    icon: this.markerIcon,
  };


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
      editable: true,
      maxBounds: bounds,
      attributionControl: false,
      minZoom: 3,
      zoomControl: false,
      maxBoundsViscosity: 1.0,
    });
    this.map.setView(center, initialZoom);
    L.control.layers(this.namesOfBaseMaps).addTo(this.map);
    this.namesOfBaseMaps['Google Maps'].addTo(this.map);
    this.map.on('click', (event: any) => {
      if (this.getPoint) {
        if (this.pointMarker !== undefined) {
          this.removePointMarker();
        }
        this.getPoint = false;
        const coords = L.latLng(event.latlng.lat, event.latlng.lng);
        const point = this.map.latLngToContainerPoint(coords);
        this.pointMarker = L.marker([coords.lat, coords.lng], {
          icon: this.markerIcon,

        }).addTo(this.map);

      }
    });
  }

  //FUNCTION THAT OBSERVE THE LAYER AND THE EVENT.TYPE  
  observeDrawingLayer(
    layer: L.Polygon | L.Polyline | L.Marker,
    type: string
  ) {
  }

  //FUNCTION THAT CLEAR EVERY DRAWS
  public clearMap(): void {

    if (this.polygonArea) {
      this.map?.removeLayer(this.polygonArea);
    }
    if (this.markerArea) {
      this.map?.removeLayer(this.markerArea)
    }
  }



  //FUNCTION THAT DETECTS WHICH BUTTON WAS CLICK AND EXECUTE A DETERMINATE TASK ACCORDING THE OPTION CHOOSEN
  //IN THE MOMENT IS NOT BEEN USED
  handleClickDrawOption(action: any, event: any): L.Marker | L.Circle | L.Polygon | undefined {


    switch (action) {
      case "marker":
        let marker: L.Marker = event.layer
        return marker
        break;

      case "circle":
        let circle: L.Circle = event.layer
        return circle
        break;

      case "polygon":
        let polygon: L.Polygon = event.layer
        return polygon
        break;

      default:
        return
        break;
    }


  }



  drawPolygon(lineOptions: L.PolylineOptions): void {
    //CLEAR THE PREVIOUS DRAWS
    this.clearMap();

    //ADD EVENT LISTENNER TO THE BUTTON AND ALLOW DRAW AND DRAG
    this.map.addEventListener(DRAWING_COMMIT, (event) => {
      const layer: L.Polygon = event.layer;
      this.polygonArea = layer;
      this.observeDrawingLayer(layer, event.type);

      //FUNCTION THAT ALLOW TO KNOW THE COORDINATES AND UPDATE EVERY TIME WHEN IS DRAG
      this.polygonArea.on('editable:vertex:dragend', function (e) {
        let coord = layer.getBounds().getCenter();
        document.getElementById("coor")!.innerHTML = coord.toString()

      });

    });
    //LINE THAT STARTS THE FUNCTION TO DRAW A POLYGON
    this.map.editTools.startPolygon(undefined, lineOptions);

  }



  pinMarker(markerOptions: L.MarkerOptions) {
    //CLEAR THE PREVIOUS DRAWS
    this.clearMap();

    //ADD EVENT LISTENNER TO THE BUTTON AND ALLOW DRAW AND DRAG
    this.map?.addEventListener(DRAWING_COMMIT, (event) => {
      const layer = event.layer;
      this.markerArea = layer;
      this.observeDrawingLayer(layer, event.type);
      this.coordinates = layer._latlng

      //FUNCTION THAT ALLOW TO KNOW THE COORDINATES AND UPDATE EVERY TIME WHEN IS DRAG
      if (this.markerArea != undefined) {
        this.markerArea.on('dragend', function (e) {
          let coord = layer._latlng;
          document.getElementById("coor")!.innerHTML = coord
        });
      }

    });
    //LINE THAT STARTS THE FUNCTION TO DRAW A MARKER
    this.map?.editTools.startMarker(undefined, markerOptions);
  }




  drawCircle(lineOptions: L.CircleMarkerOptions): void {
    //CLEAR THE PREVIOUS DRAWS
    this.clearMap();

    //ADD EVENT LISTENNER TO THE BUTTON AND ALLOW DRAW AND DRAG
    this.map.addEventListener(DRAWING_COMMIT, (event) => {
      const layer: L.Polygon = event.layer;
      this.polygonArea = layer;
      this.observeDrawingLayer(layer, event.type);

      //FUNCTION THAT ALLOW TO KNOW THE COORDINATES AND UPDATE EVERY TIME WHEN IS DRAG
      this.polygonArea.on('editable:vertex:dragend', function (e) {
        let coord = layer.getBounds().getCenter();
        document.getElementById("coor")!.innerHTML = coord.toString()

      });

    });
    //LINE THAT STARTS THE FUNCTION TO DRAW A CIRCLE
    this.map.editTools.startCircle(undefined, lineOptions);




  }







}
