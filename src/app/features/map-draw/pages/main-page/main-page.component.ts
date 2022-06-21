import { HttpHeaders } from '@angular/common/http';
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { MapService,ListService } from '@core';
import { __asyncValues, __values } from 'tslib';




@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit{
  
  servicesData = {};

  
  constructor(public mapService:MapService,public api:ListService) {}

   ngOnInit(): void {
    console.log(this.api.getServices())
     //console.log(this.api.getServices({headers: new HttpHeaders().set('','')}).subscribe((data)=>{this.servicesData = data}))
   }


  



}
