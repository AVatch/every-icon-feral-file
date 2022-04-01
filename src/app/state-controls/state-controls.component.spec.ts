import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateControlsComponent } from './state-controls.component';

describe('StateControlsComponent', () => {
  let component: StateControlsComponent;
  let fixture: ComponentFixture<StateControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StateControlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StateControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
