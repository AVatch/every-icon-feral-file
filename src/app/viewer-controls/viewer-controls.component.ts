import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-viewer-controls',
  templateUrl: './viewer-controls.component.html',
  styleUrls: ['./viewer-controls.component.scss'],
})
export class ViewerControlsComponent implements OnInit {
  @Output() appSubmit: EventEmitter<string> = new EventEmitter();

  formGroup = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  constructor() {}

  ngOnInit(): void {}

  onSubmit() {
    if (!this.formGroup.valid) {
      this.raiseAlert();
      return;
    }

    let code = this.formGroup.value.code;

    this.appSubmit.emit(code);
  }

  raiseAlert(message: String = 'not valid') {
    alert(message);
  }
}
