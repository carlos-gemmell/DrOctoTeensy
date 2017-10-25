import { Component, Input, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SocketService } from '../socket.service';


import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-draw-pad',
  templateUrl: './draw-pad.component.html',
  styleUrls: ['./draw-pad.component.css']
})
export class DrawPadComponent implements AfterViewInit {

  @ViewChild('canvas') public canvas: ElementRef;

  @Input() public width = 400;
  @Input() public height = 400;

  socketService: SocketService;

  private cx: CanvasRenderingContext2D;

  el: ElementRef;

  constructor(el: ElementRef, socketService: SocketService){
    this.el = el;
    this.socketService = socketService;
  }

  public ngAfterViewInit() {
    const parentElem = this.el.nativeElement.parentNode;
    console.log(parentElem.offsetWidth);
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    canvasEl.width = this.width = parentElem.offsetWidth;
    canvasEl.height = this.height = parentElem.offsetWidth*0.66;

    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

    this.captureEvents(canvasEl);
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    Observable
      .fromEvent(canvasEl, 'touchstart')
      .switchMap((e) => {
        console.log("started!");
        return Observable
          .fromEvent(canvasEl, 'touchmove')
          .takeUntil(Observable.fromEvent(canvasEl, 'mouseup'))
          .pairwise()
      })
      .subscribe((res: [TouchEvent, TouchEvent]) => {
        const rect = canvasEl.getBoundingClientRect();
        console.log("moving");
        res
        const prevPos = {
          x: res[0].touches[0].clientX - rect.left,
          y: res[0].touches[0].clientY - rect.top
        };

        const currentPos = {
          x: res[1].touches[0].clientX - rect.left,
          y: res[1].touches[0].clientY - rect.top
        };
        var rectWidth = rect.right - rect.left;
        var rectHeight = rect.bottom - rect.top;

        console.log(Math.round((currentPos.x/rectWidth)*60), Math.round((currentPos.y/rectHeight)*40));
        this.socketService.positionUpdate(Math.round((currentPos.x/rectWidth)*60), Math.round((currentPos.y/rectHeight)*40));

        this.drawOnCanvas(prevPos, currentPos);
      },()=>{}, ()=>{
        console.log("touch ended!")
        this.socketService.touchEnd();
      });
  }

  private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) {
    if (!this.cx) { return; }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();
    }
  }

}
