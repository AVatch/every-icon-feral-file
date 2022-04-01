import { Component } from '@angular/core';
import { environment } from './../environments/environment';

import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  app: FirebaseApp;

  title = 'every-icon';

  state: number[] | null = null;
  // state$: Observable<number[] | null> = of(this.state);
  state$: Subject<number[] | null> = new Subject();

  constructor() {
    this.app = initializeApp(environment.firebase);

    this.subscribeToStore();
    // this.state$ = onSnapshot(doc(getFirestore(), "state", "icon"))
  }

  subscribeToStore() {
    onSnapshot(doc(getFirestore(), 'state', 'icon'), (snapshot) => {
      if (!snapshot.exists()) {
        // this.state = null;
        this.state$.next(null);
        return;
      }

      const data = snapshot.data();

      const nextState = Object.keys(data)
        .map((key) => ({ key: parseInt(key), value: data[key] }))
        .sort((a, b) => a.key - b.key)
        .map((pair) => pair.value)
        .map((value) => value % 2);

      console.log(nextState);

      // this.state = nextState;
      this.state$.next(nextState);
    });
  }

  onSelect(i: number) {
    updateDoc(doc(getFirestore(), 'state', 'icon'), {
      [i.toString()]: increment(1),
    });
  }

  onRandomizeState(n: number = 1024) {
    let newState = new Array(n)
      .fill(0)
      .map((_) => (Math.random() > 0.5 ? 1 : 0))
      .reduce((acc, curr, i) => ({ ...acc, [i]: curr }), {});

    setDoc(doc(getFirestore(), 'state', 'icon'), newState);
  }
}
