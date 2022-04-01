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

  test: number[] = new Array(1024)
    .fill(0)
    .map((_) => (Math.random() > 0.5 ? 1 : 0));

  constructor() {
    const app = initializeApp(environment.firebase);
  }
}
