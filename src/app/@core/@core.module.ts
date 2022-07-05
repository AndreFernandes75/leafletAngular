import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService,ListService,ShapefileService,SearchService } from './services';




@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    
    
  ],
  exports:[
    
  ],
  providers:[
    MapService,
    ListService,
    ShapefileService,
    SearchService
   
  ]
  
})
export class coreModule { }
