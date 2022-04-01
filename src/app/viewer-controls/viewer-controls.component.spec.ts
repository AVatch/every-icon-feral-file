import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerControlsComponent } from './viewer-controls.component';

describe('ViewerControlsComponent', () => {
  let component: ViewerControlsComponent;
  let fixture: ComponentFixture<ViewerControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewerControlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
