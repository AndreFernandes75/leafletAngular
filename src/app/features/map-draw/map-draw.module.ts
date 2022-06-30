import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { coreModule } from '@core/@core.module';
import { MapService } from '@core';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  imports:[
    ReactiveFormsModule
  ],
  declarations: [
    
  ],
  imports: [
    CommonModule,
    coreModule
  ],
  
})
export class MapDrawModule { }
