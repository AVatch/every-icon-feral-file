import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { Router } from '@angular/router';

import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-controls',
  templateUrl: './admin-controls.component.html',
  styleUrls: ['./admin-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminControlsComponent implements OnInit {
  @Input() interactable: boolean | null = null;
  @Input() sessions:
    | {
        id: string;
        isAdmin: boolean;
        restrictTo: number[];
      }[]
    | null = [];

  @Output() appRandomize: EventEmitter<void> = new EventEmitter();
  @Output() appClear: EventEmitter<void> = new EventEmitter();
  @Output() appSetInteractable: EventEmitter<boolean> = new EventEmitter();
  @Output() appSetParticipants: EventEmitter<number> = new EventEmitter();
  @Output() appDump: EventEmitter<void> = new EventEmitter();

  formGroup = new FormGroup({
    count: new FormControl(0, [
      Validators.required,
      Validators.min(1),
      Validators.max(1024),
    ]),
  });

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onCreateSessions() {
    if (!this.formGroup.valid) {
      this.raiseAlert();
      return;
    }

    let count = this.formGroup.value.count;

    this.appSetParticipants.emit(count);
  }

  onResetSessions() {
    this.appSetParticipants.emit(0);
  }

  parseLink(id: string) {
    return `${window.location.origin}?key=${id}`;
  }

  raiseAlert(message: String = 'not valid') {
    alert(message);
  }
}
