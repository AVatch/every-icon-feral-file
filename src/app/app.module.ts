import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IconGridComponent } from './icon-grid/icon-grid.component';
import { StateControlsComponent } from './state-controls/state-controls.component';
import { ParticipantControlsComponent } from './participant-controls/participant-controls.component';
import { ViewerControlsComponent } from './viewer-controls/viewer-controls.component';
import { LoginComponent } from './login/login.component';
import { AdminControlsComponent } from './admin-controls/admin-controls.component';

@NgModule({
  declarations: [
    AppComponent,
    IconGridComponent,
    StateControlsComponent,
    ParticipantControlsComponent,
    ViewerControlsComponent,
    LoginComponent,
    AdminControlsComponent,
  ],
  imports: [BrowserModule, ReactiveFormsModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
