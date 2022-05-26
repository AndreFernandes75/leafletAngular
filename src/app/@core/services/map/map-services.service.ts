import { Component, Injectable, OnInit } from '@angular/core';


import * as L from 'leaflet';

export { ZERO_OPACITY, HALF_OPACITY, DRAWING_COMMIT };



const ZERO_OPACITY = 0;
const HALF_OPACITY = 0.5;
const DRAWING_COMMIT = 'editable:drawing:commit';


 @Injectable({
   providedIn:'root'
 })

export class MapService implements OnInit {

  public lineOptions: L.PolylineOptions =
    {
      color: '#ff0000', lineJoin: 'round',
    };

  private polygonArea?: L.Polygon;

  title = 'leafletAngular';
  map!: L.Map;
  
  

  ngOnInit(): void {
    //CREATING A MAP WITH COORDINATES IN PORTUGAL
    this.map = L.map('map', { editable: true }).setView([38.72726949553772, -9.13994942204751], 13);

    //ADDING LEAFLET TO THE MAP
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

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
