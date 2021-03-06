import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MainPageComponent } from 'features/map-draw/pages/main-page/main-page.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapDrawComponent } from 'shared/components/map-draw/map-draw.component';
import { ListService } from '@core';
import { HttpClientModule } from '@angular/common/http';
import { ResultsComponent } from 'shared/components/results/results.component';





@NgModule({
  declarations: [
    AppComponent,
    MapDrawComponent,
    MainPageComponent,
    ResultsComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  
  ],
  providers: [ResultsComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
