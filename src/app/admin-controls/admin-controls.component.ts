import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { getFirestore, doc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-admin-controls',
  templateUrl: './admin-controls.component.html',
  styleUrls: ['./admin-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminControlsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  onRandomizeState(n: number = 1024) {
    let newState = new Array(n)
      .fill(0)
      .map((_) => (Math.random() > 0.5 ? 1 : 0))
      .reduce((acc, curr, i) => ({ ...acc, [i]: curr }), {});

    setDoc(doc(getFirestore(), 'state', 'icon'), newState);
  }
}
