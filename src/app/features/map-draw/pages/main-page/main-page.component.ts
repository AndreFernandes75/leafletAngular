import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { MapService,ListService } from '@core';




@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
  
  servicesData = null;

  constructor(public mapService:MapService,public api:ListService) {}

  // ngOnInit(): void {
    
  //   this.api.getServices().subscribe((data)=>{this.servicesData = data;});
  // }


  



}
