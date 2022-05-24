import { Injectable } from '@angular/core';
import { DRAWING_COMMIT, DrawingLayer } from '@core';
import 'leaflet';
import { control, GeoJSON, Layer } from 'leaflet';
import 'leaflet-editable';
import 'leaflet-geotiff-2';
import 'leaflet-geotiff-2/dist/leaflet-geotiff-plotty';
// optional renderers
import 'leaflet-geotiff-2/dist/leaflet-geotiff-rgb';
import 'leaflet-geotiff-2/dist/leaflet-geotiff-vector-arrows';
import { BehaviorSubject } from 'rxjs';
import { toDms, toWkt } from 'shared/helpers';
import * as L from 'leaflet';
import layers = control.layers;

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public drawingLayer$: BehaviorSubject<DrawingLayer>;
  public scale?: number;
  public cursorLatLng?: string;
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
  public getPoint: boolean = false;
  public isDrawing: boolean = false;
  private map!: L.Map;
  private basemap!: L.TileLayer;
  private geoLayers!: Map<string, L.Layer[]>;
  private Layer!: string;
  private Styles!: string;
  private BBox!: string;
  private markerIcon = L.icon({
    iconUrl: 'assets/img/marker.svg',
    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62], // the same for the shadow
    popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
  });
  private lineOptions: L.PolylineOptions = {
    color: '#ff0000',
    lineJoin: 'round',
  };
  private markerOptions: L.MarkerOptions = {
    icon: this.markerIcon,
  };
  private pointMarker: any;
  private polygonArea?: L.Polygon;
  private pointArea?: L.Marker;
  private markerArea?: L.Marker;
  private populatedLayer?: L.GeoJSON;
  private footprintLayer?: L.GeoJSON;
  private shapeFileLayerGroup!: L.FeatureGroup;
  private footprintArea?: L.Polygon;
  private lineArea: any;

  constructor() {
    this.drawingLayer$ = new BehaviorSubject<DrawingLayer>(undefined);
    this.basemap?.addTo(this.map);
    this.geoLayers = new Map();
  }

  get geoJSON() {
    if (this.polygonArea !== undefined) {
      return this.polygonArea.toGeoJSON();
    }
    if (this.pointMarker !== undefined) {
      return this.pointMarker.toGeoJSON();
    }
    if (this.lineArea !== undefined) {
      return this.lineArea.toGeoJSON();
    }
    return null;
  }

  get geoWkt() {
    if (this.polygonArea !== undefined) {
      return toWkt(this.polygonArea);
    }
    if (this.markerArea !== undefined) {
      return toWkt(this.markerArea);
    }
    if (this.lineArea !== undefined) {
      return toWkt(this.lineArea);
    }
    return null;
  }

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

    this.setScale();

    this.map?.on('mousemove', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;

      this.cursorLatLng = `${toDms(lat, lng).lat}, ${toDms(lat, lng).lng}`;
    });

    this.map?.on('editable:vertex:dragend', (event) =>
      this.observeDrawingLayer(event.layer, event.type)
    );

    this.map?.on('editable:vertex:deleted', (event) =>
      this.observeDrawingLayer(event.layer, event.type)
    );

    this.map?.on('editable:dragend', (event) =>
      this.observeDrawingLayer(event.layer, event.type)
    );

    this.map?.on('editable:drag', (event) =>
      this.observeDrawingLayer(event.layer, event.type)
    );

    this.map?.on('editable:drawing:start', () => (this.isDrawing = true));
    this.map?.on('editable:drawing:end', () => (this.isDrawing = false));
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
          case 'Polygon':
          case 'MultiPolygon':
            this.polygonArea = layer as L.Polygon;
            break;
          case 'LineString':
            this.lineArea = layer as L.Polyline;
            break;
          case 'Point':
            this.pointArea = layer as L.Marker;
            break;
        }
      });
    }
  }

  public generateLayerFromShapefile(geoJSON: GeoJSON.GeoJSON) {}

  public populateMapWithFeatureGroup(featureGroup: L.FeatureGroup) {
    this.clearMap();
    this.shapeFileLayerGroup = new L.FeatureGroup([featureGroup]).addTo(
      this.map
    );
    this.map.fitBounds(featureGroup.getBounds())
  }

  public setBaseMap(basemapUrl: string, attribution: string): void {
    L.tileLayer(basemapUrl, { attribution }).addTo(this.map);
  }

  public replaceBasemap(basemap: L.TileLayer): void {
    if (this.basemap) {
      this.map.removeLayer(this.basemap);
    }
    basemap.addTo(this.map);
    this.basemap = basemap;
  }

  public removePointMarker() {
    if (this.pointMarker !== undefined) {
      this.map.removeLayer(this.pointMarker);
      this.pointMarker = undefined;
    }
  }

  public destroyMap() {
    if (this.map !== undefined) {
      this.map.remove();
    }
  }

  public drawOnMap(typeOfDraw: string) {
    this.clearMap();
    switch (typeOfDraw) {
      case 'polygon':
        this.drawPolygon(this.lineOptions);
        break;
      case 'line':
        this.drawLine(this.lineOptions);
        break;
      case 'marker':
        this.pinMarker(this.markerOptions);
        break;
    }
  }

  public async setFootprint(geoJSON: GeoJSON.GeoJSON) {
    let lineOptions: L.PolylineOptions = {
      color: '#54b200',
      lineJoin: 'round',
    };
    if (geoJSON && this.map) {
      this.footprintLayer = L.geoJSON(undefined, lineOptions).addTo(
        this.map as L.Map
      );
      this.footprintLayer?.addData(geoJSON);
      if (this.footprintLayer) {
        const bounds = this.footprintLayer?.getBounds();
        this.map?.fitBounds(bounds);
      }

      this.footprintLayer?.getLayers().map((layer) => {
        this.footprintArea = layer as L.Polygon;
      });
    }
  }

  public clearMap(): void {
    if (this.polygonArea) {
      this.map?.removeLayer(this.polygonArea);
      this.polygonArea = undefined;
    }
    if (this.markerArea) {
      this.map?.removeLayer(this.markerArea);
      this.markerArea = undefined;
    }
    if (this.lineArea) {
      this.map?.removeLayer(this.lineArea);
      this.lineArea = undefined;
    }
    if (this.shapeFileLayerGroup) {
      this.map.removeLayer(this.shapeFileLayerGroup);
      this.shapeFileLayerGroup.clearLayers();
    }
  }

  public clearFootprint(): void {
    if (this.footprintArea) {
      this.map?.removeLayer(this.footprintArea);
      this.footprintArea = undefined;
    }
  }

  public addGeoTiff(layerId: string, URI: string) {
    const uriArray = URI.split('?');

    const baseUrl = uriArray[0];
    const params = uriArray[1].split('&');

    params.map((param) => {
      const key = param.split('=')[0].toUpperCase();

      if (key.includes('LAYERS')) {
        this.Layer = decodeURIComponent(param.split('=')[1]);
      } else if (key.includes('BBOX')) {
        this.BBox = decodeURIComponent(param.split('=')[1]);
      } else if (key.includes('STYLES')) {
        this.Styles = decodeURIComponent(param.split('=')[1]);
      }
    });

    const minX = Number(this.BBox.split(',')[1]);
    const minY = Number(this.BBox.split(',')[0]);
    const maxX = Number(this.BBox.split(',')[3]);
    const maxY = Number(this.BBox.split(',')[2]);

    const min = L.latLng(minY, minX);
    const max = L.latLng(maxY, maxX);

    const bounds = L.latLngBounds(min, max);

    const leafletSources: L.Layer[] = [
      this.addTileLayerWMS(
        baseUrl,
        this.tileLayerWMS(this.Layer, this.Styles, bounds)
      ),
    ];
    this.geoLayers.set(layerId, leafletSources);

    this.map.fitBounds(bounds);

    return leafletSources;
  }

  public destroyLayer(layerId: string) {
    const layers = this.geoLayers?.get(layerId);
    layers?.forEach((layer) => this.map.removeLayer(layer));
  }

  public destroyAllLayers() {
    const values = this.geoLayers.values();

    const layerArrays = Array.from(values);

    const layers: Layer[] = [];

    layerArrays.forEach((layerArray) =>
      layerArray.forEach((layer) => layers.push(layer))
    );

    layers?.forEach((layer) => this.map.removeLayer(layer));
  }

  private tileLayerWMS = (
    layers: string,
    styles: string,
    bounds: L.LatLngBoundsExpression
  ) => ({
    layers,
    format: 'image/png',
    transparent: true,
    maxZoom: 22,
    styles,
    bounds,
    zIndex: 200,
  });

  private setScale() {
    const getScale = () => {
      const screenDpi = 96;
      const inchPerDecimalDegree = 4374754;
      const bounds = this.map.getBounds();
      const width = bounds.getEast() - bounds.getWest();

      const screenWidth = this.map.getSize().x;

      return (width * inchPerDecimalDegree * screenDpi) / screenWidth;
    };

    this.map?.on('move', () => {
      this.scale = getScale();
    });

    this.scale = getScale();
  }

  private observeDrawingLayer(
    layer: L.Polygon | L.Polyline | L.Marker,
    type: string
  ) {
    const wkt = toWkt(layer);
    if (wkt) this.drawingLayer$.next({ wkt, layer, type });
  }

  private pinMarker(markerOptions: L.MarkerOptions) {
    this.map?.addEventListener(DRAWING_COMMIT, (event) => {
      const layer = event.layer;
      // layer.disableEdit();
      this.markerArea = layer;
      this.observeDrawingLayer(layer, event.type);
    });
    this.map?.editTools.startMarker(undefined, markerOptions);
  }

  private drawPolygon(lineOptions: L.PolylineOptions): void {
    this.map.addEventListener(DRAWING_COMMIT, (event) => {
      const layer: L.Polygon = event.layer;
      // const shape: L.LatLng[] = layer.getLatLngs() as L.LatLng[];
      // layer.disableEdit();
      this.polygonArea = layer;
      this.observeDrawingLayer(layer, event.type);
    });
    this.map.editTools.startPolygon(undefined, lineOptions);
  }

  private drawLine(lineOptions: L.PolylineOptions): void {
    this.map.addEventListener(DRAWING_COMMIT, (event: any) => {
      const layer: L.Polyline = event.layer;
      // const shape: L.LatLng[] = layer.getLatLngs() as L.LatLng[];
      // layer.disableEdit();
      this.lineArea = layer;
      this.observeDrawingLayer(layer, event.type);
    });
    this.map.editTools.startPolyline(undefined, lineOptions);
  }

  private addTileLayerWMS(
    baseUrl: string,
    options: L.WMSOptions
  ): L.TileLayer.WMS {
    return L.tileLayer.wms(baseUrl, options).addTo(this.map as L.Map);
  }
}

// https://nrt.cmems-du.eu/thredds/wms/METOFFICE-GLO-SST-L4-NRT-OBS-SST-MON-V2?service=WMS&request=GetMap&layers=analysed_sst&styles=boxfill%2Fncview&format=image%2Fpng&transparent=true&version=1.1.1&width=256&height=256&srs=EPSG%3A3857&bbox=0,-5009377.085697311,5009377.085697311,0

// https://nrt.cmems-du.eu/thredds/wms/METOFFICE-GLO-SST-L4-NRT-OBS-SST-MON-V2?request=GetMap&version=1.3.0&layers=analysed_sst&crs=EPSG:4326&width=500&height=500&styles=boxfill/ncview&format=image/png&bbox=36.87522167200121,-21.21333042960338,42.15932709582888,-6.1840335546033804&time=