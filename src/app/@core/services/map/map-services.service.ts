import { Component, Injectable } from '@angular/core';


import * as L from 'leaflet';

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

  public lineOptions: L.PolylineOptions =
    {
      color: '#ff0000', lineJoin: 'round',
    };



  private polygonArea?: L.Polygon;

  title = 'leafletAngular';
  private map!: L.Map;
  private markerArea?: L.Marker;

  private markerIcon = L.icon({
    iconUrl: 'assets/img/marker.svg',
    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62], // the same for the shadow
    popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
  });

  private pointMarker: any;
  public getPoint: boolean = false;
  public scale?: number;

  public removePointMarker() {
    if (this.pointMarker !== undefined) {
      this.map.removeLayer(this.pointMarker);
      this.pointMarker = undefined;
    }
  }

  public markerOptions: L.MarkerOptions = {
    icon: this.markerIcon,
  };




 

  //ngAfterViewInit(): void {
  //var map = L.map('map').setView([38.72726949553772, -9.13994942204751], 13);


  /*var marker = L.marker([38.72726949553772, -9.13994942204751]).addTo(map);
  
  var polygon = L.polygon([
  [38.7369109882447, -9.184238056304734],
  [38.69619361222479, -9.214450457968574],
  [38.72967999071096, -9.15024910443291]
  ]).addTo(map);
  
  var circle = L.circle([38.74012452996236, -9.213763812476214], {
  color: 'red',
  fillColor: '#f03',
  fillOpacity: 0.5,
  radius: 500
  }).addTo(map);
  
  var popup = L.popup()
  .setLatLng([38.72405537546273, -9.189387897497435])
  .setContent("I am a standalone popup.")
  .openOn(map);*/


  /*
  var buttonMarker = document.getElementById("buttonMarker");
  var buttonCircle = document.getElementById("buttonCircle");
  var coord = document.getElementById("coor");
  
  buttonMarker?.addEventListener('click',function(){
  
  map.on('click', <LeafletMouseEvent> (e:any) =>{
  if(coord != null){
  coord.textContent = e.latlng.lat, e.latlng.lng;}
  var marker = L.marker([e.latlng.lat,e.latlng.lng]).addTo(map);
  });
  });
  
  buttonCircle?.addEventListener('click',function(){
  
  
  map.on('click', <LeafletMouseEvent> (e:any) =>{
  if(coord != null){
  coord.textContent = e.latlng.lat, e.latlng.lng;}
  var c = L.circle([e.latlng.lat,e.latlng.lng], {radius: 200}).addTo(map);
  });
  
  });
  
  
  }*/



  //FUNCTION THAT CREATES A LISTENER OF BUTTONS THAT ALLOWS TO DRAW IN MAP 



  // onClickDraw(drawOption: string) {


  //   this.map.removeEventListener('click')


  //   this.map.addEventListener(DRAWING_COMMIT, (event: any) => {
  //     this.map.on('click', <LeafletMouseEvent>(e: any) => {

  //       let coord = document.getElementById("coor");
  //       if (coord != null) {
  //         coord.textContent = e.latlng.lat, e.latlng.lng;
  //       }
  //       let geometryLayer = this.handleClickDrawOption(drawOption, event.type)?.addTo(this.map);



  //       geometryLayer?.addTo(this.map)
  //       console.log(geometryLayer)



  //     }); this.map.editTools.startPolygon(undefined);
  //   });


  //   console.log(drawOption);


  // }

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



  drawPolygon(lineOptions: L.PolylineOptions): void {


    this.map.addEventListener(DRAWING_COMMIT, (event) => {
      const layer: L.Polygon = event.layer;
      layer.disableEdit();;

      this.polygonArea = layer;
      this.observeDrawingLayer(layer, event.type);
      //this.map.editTools.startPolygon(undefined, lineOptions);
      console.log("adadad")
    });





  }

  pinMarker(markerOptions: L.MarkerOptions) {
    this.map?.addEventListener(DRAWING_COMMIT, (event) => {
      const layer = event.layer;
      // layer.disableEdit();
      this.markerArea = layer;
      this.observeDrawingLayer(layer, event.type);
    });
    this.map?.editTools.startMarker(undefined, markerOptions);
  }

  observeDrawingLayer(
    layer: L.Polygon | L.Polyline | L.Marker,
    type: string
  ) {
    //const wkt = toWkt(layer);
    //if (wkt) this.drawingLayer$.next({ wkt, layer, type });
  }



  //FUNCTION THAT DETECTS WHICH BUTTON AS CLICK AND EXECUTE A DETERMINATE TASK ACCORDING THE OPTION CHOOSEN
  handleClickDrawOption(action: any, event: any): L.Marker | L.Circle | L.Polygon | undefined {

    //let marker = L.marker([e.latlng.lat,e.latlng.lng]).addTo(this.map);



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

  // private lineOptions: L.PolylineOptions = {
  //   color: '#ff0000',
  //   lineJoin: 'round',
  //   };
  //   private drawPolygon(lineOptions: L.PolylineOptions): void {
  //   this.map.addEventListener(DRAWING_COMMIT, (event) => {
  //   const layer: L.Polygon = event.layer;
  //   // const shape: L.LatLng[] = layer.getLatLngs() as L.LatLng[];
  //   // layer.disableEdit();
  //   this.polygonArea = layer;
  //   this.observeDrawingLayer(layer, event.type);
  //   });
  //   this.map.editTools.startPolygon(undefined, lineOptions);
  //   }


}
