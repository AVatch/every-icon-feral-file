import { Component } from '@angular/core';
import { environment } from './../environments/environment';

import { initializeApp } from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'every-icon-feral-file';

  constructor() {
    const app = initializeApp(environment.firebase);
  }
}
