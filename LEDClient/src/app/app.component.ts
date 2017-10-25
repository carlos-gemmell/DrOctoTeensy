import { Component, OnInit } from '@angular/core';
import { SocketService } from './socket.service';

declare var d3;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'app';
  socketService: SocketService;
  constructor(socketService: SocketService) {
    this.socketService = socketService;

  }

  ngOnInit(){
    d3.select("svg").on("touchstart", function(d){console.log("touch started")})
    .on("touchmove", (d)=>{console.log("touch moved", d3.select("svg")._parents)})
    .on("touchend", ()=>{console.log("touchend")});
  }

  valueChange(val){
    console.log(val);
    //this.socketService.sendMessage(val)
  }

  touchStatus(){
    console.log("panel touched");
  }

  submit(){
    console.log("submitted!")
    this.socketService.submit();
  }
}
