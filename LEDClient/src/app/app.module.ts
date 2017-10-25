import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SocketService } from './socket.service';

import { AppComponent } from './app.component';
import { DrawPadComponent } from './draw-pad/draw-pad.component';

@NgModule({
  declarations: [
    AppComponent,
    DrawPadComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
