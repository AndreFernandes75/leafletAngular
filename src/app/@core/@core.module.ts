import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from './services';
import { ListService } from './services';
import { ShapefileService } from './services';



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
    ShapefileService
   
  ]
  
})
export class coreModule { }
