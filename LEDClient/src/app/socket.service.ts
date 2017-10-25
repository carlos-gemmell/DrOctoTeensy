import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class SocketService {

  private url = 'http://localhost:8080';
  private socket;

  constructor() {
    this.socket = io({ path: '/socket/socket.io'});
    console.log("trying to connect to socket server");
  }
  private posKeys = "";


  positionUpdate(xPos,yPos){
    //this.socket.emit('newPos', {x:xPos, y:yPos});
    this.posKeys = this.posKeys.concat(xPos.toString());
    this.posKeys = this.posKeys.concat(yPos.toString());
  }

  touchEnd(){
    this.socket.emit('touchEnd', {});
  }

  submit(){
    this.socket.emit('submit', {key: this.posKeys});
  }

}
