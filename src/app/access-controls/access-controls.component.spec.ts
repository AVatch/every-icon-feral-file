import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessControlsComponent } from './access-controls.component';

describe('AccessControlsComponent', () => {
  let component: AccessControlsComponent;
  let fixture: ComponentFixture<AccessControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessControlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
