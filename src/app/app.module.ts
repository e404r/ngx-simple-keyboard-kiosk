import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxSimpleKeyboardKioskModule } from "ngx-simple-keyboard-kiosk";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SurveyModule } from "survey-angular-ui";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxSimpleKeyboardKioskModule,
    NgbModule,
    SurveyModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
