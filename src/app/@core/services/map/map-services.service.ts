import { Component, Injectable, Output, EventEmitter, ApplicationModule } from '@angular/core';
import * as turf from '@turf/turf'
import * as L from 'leaflet';
import 'leaflet-draw';
// import 'leaflet-editable';
import { on } from 'events';
import { convertToWK, parseFromWK } from 'wkt-parser-helper';
import * as shp from 'shpjs';
import { map, Observable } from 'rxjs';
import { ListService } from '../listOfServices/list.service';
import { threadId } from 'worker_threads';



export { ZERO_OPACITY, HALF_OPACITY };



const ZERO_OPACITY = 0;
const HALF_OPACITY = 0.5;



@Injectable({
  providedIn: 'root'
})

export class MapService {

  constructor(public api: ListService) { }



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
  public drawOptions: any;
  public coordinates: any;
  //private polygonArea?: L.Polygon;//ELIMINAR DEPOIS
  private circleArea?: any;
  title = 'leafletAngular';
  private markerArea?: any;
  public pointMarker: any;
  public getPoint: boolean = false;
  private populatedLayer?: L.GeoJSON;
  private shapeLayer?: L.GeoJSON;
  private shapeFileLayerGroup!: L.FeatureGroup;
  public wktPolygon: any;
  public observableDraw: any;
  private polygonArea?: any;
  public p: number = 1;



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
      maxBounds: bounds,
      attributionControl: false,
      minZoom: 3,
      zoomControl: false,
      maxBoundsViscosity: 1.0,
    });
    var drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);
    var drawControl = new L.Control.Draw({
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

      }

    });



    this.map.addControl(drawControl);
    this.map.setView(center, initialZoom);
    L.control.layers(this.namesOfBaseMaps).addTo(this.map);
    this.namesOfBaseMaps['Google Maps'].addTo(this.map);


  }

  //FUNCTION THAT OBSERVE THE LAYER AND THE EVENT.TYPE  
  observeDrawingLayer(
    layer: L.Polygon | L.Polyline | L.Marker,
    page: number,

  ) {
    const wkt: any = convertToWK(layer.toGeoJSON());
    return this.api.getServicesByPolygon(page, wkt);
  }

  //FUNCTION THAT CLEAR EVERY DRAWS
  public clearMap(): void {

    if (this.polygonArea) {
      this.map?.removeLayer(this.polygonArea);
      document.getElementById("coor")!.innerHTML = ""
    }
    if (this.markerArea) {
      this.map?.removeLayer(this.markerArea)
      document.getElementById("coor")!.innerHTML = ""
    }
    if (this.circleArea) {
      this.map?.removeLayer(this.circleArea)
      document.getElementById("coor")!.innerHTML = ""
    }
    if (this.shapeFileLayerGroup) {
      this.map.removeLayer(this.shapeFileLayerGroup);
      this.shapeFileLayerGroup.clearLayers();
    }
  }






  // public editTool = new L.EditToolbar.Edit(this.map, {
  //   featureGroup: drawControl.options.featureGroup,
  //   selectedPathOptions: drawControl.options.edit.selectedPathOptions
  // })




  drawPolygon(lineOptions: L.PolylineOptions) {
    this.clearMap()
    let polygonDrawer = new L.Draw.Polygon(this.map).enable();
    this.polygonArea = new L.FeatureGroup();
    let editableLayers = this.polygonArea;
    this.map.addLayer(editableLayers);
    let wkt = this.wktPolygon;


    this.map.on(L.Draw.Event.CREATED, function (e: any) {
      let type = (e as L.DrawEvents.Created).layerType,
        layer = e.layer;
      editableLayers.addLayer(layer)
      if (type == "polygon") {
        let coord = layer.getBounds().getCenter();
        document.getElementById("coor")!.innerHTML = coord.toString();
        wkt = convertToWK(layer.toGeoJSON());
        console.log(wkt)
        layer.editing.enable();

      }



    });


  }



  pinMarker(markerOptions: L.MarkerOptions) {

    this.clearMap();
    let markerDrawer = new L.Draw.Marker(this.map).enable();
    this.markerArea = new L.FeatureGroup();
    let editableLayers = this.markerArea;
    this.map.addLayer(editableLayers);
    this.map.on(L.Draw.Event.CREATED, function (e) {
      let type = (e as L.DrawEvents.Created).layerType,
        layer = e.layer;
      editableLayers.addLayer(layer).dra;

      if (type == "marker") {
        let coord = layer._latlng;
        document.getElementById("coor")!.innerHTML = coord.toString();
        layer.editing.enable();
      }

    })

    this.map.on(L.Draw.Event.EDITMOVE, function (event: any) {
      let type = (event as L.DrawEvents.EditMove).type,
        layer = event.layer;
      editableLayers.addLayer(layer)
      let coord = layer._latlng;
      document.getElementById("coor")!.innerHTML = coord.toString();


    })



  }




  drawCircle(lineOptions: L.CircleMarkerOptions) {

    this.clearMap();
    let circleDrawer = new L.Draw.Circle(this.map).enable();
    this.circleArea = new L.FeatureGroup();
    let editableLayers = this.circleArea;
    this.map.addLayer(editableLayers);
    this.map.on(L.Draw.Event.CREATED, function (e) {
      let type = (e as L.DrawEvents.Created).layerType,
        layer = e.layer;
      editableLayers.addLayer(layer);

      if (type == "circle") {
        let coord = layer._latlng;
        document.getElementById("coor")!.innerHTML = coord.toString();

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




//CÓDIGO LEAFLET EDITABLE
// drawCircle(lineOptions: L.CircleMarkerOptions): void {
//   //CLEAR THE PREVIOUS DRAWS
//   this.clearMap();

//   //ADD EVENT LISTENNER TO THE BUTTON AND ALLOW DRAW AND DRAG
//   this.map.addEventListener(DRAWING_COMMIT, (event) => {
//     const layer: L.Polygon = event.layer
//     this.polygonArea = layer
//     this.observeDrawingLayer(layer, 17);


//     //FUNCTION THAT ALLOW TO KNOW THE COORDINATES AND UPDATE EVERY TIME WHEN IS DRAG
//     this.polygonArea.on('editable:vertex:dragend', function (e) {
//       let coord = layer.getBounds().getCenter();
//       document.getElementById("coor")!.innerHTML = coord.toString()

//     });

//   });
//   //LINE THAT STARTS THE FUNCTION TO DRAW A CIRCLE
//   this.map.editTools.startCircle(undefined, lineOptions);

// }