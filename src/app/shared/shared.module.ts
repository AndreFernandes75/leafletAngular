import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapDrawComponent } from './components/map-draw/map-draw/map-draw.component';
import { ResultsComponent } from './components/results/results.component';







@NgModule({
  declarations: [
   
    
  ],
  imports: [
    CommonModule
  ],
  providers:[
  ResultsComponent,
  
  ]
})
export class SharedModule { }
