import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantControlsComponent } from './participant-controls.component';

describe('ParticipantControlsComponent', () => {
  let component: ParticipantControlsComponent;
  let fixture: ComponentFixture<ParticipantControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParticipantControlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
