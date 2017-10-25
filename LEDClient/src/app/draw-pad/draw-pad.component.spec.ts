import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawPadComponent } from './draw-pad.component';

describe('DrawPadComponent', () => {
  let component: DrawPadComponent;
  let fixture: ComponentFixture<DrawPadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawPadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawPadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
