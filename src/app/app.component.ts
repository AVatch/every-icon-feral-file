import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from './../environments/environment';

import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  increment,
} from 'firebase/firestore';

import { Subject, combineLatest } from 'rxjs';
import { take, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  app: FirebaseApp;

  title = 'every-icon';

  pieceId: string = 'icon';

  sessionId: string | null = null;
  hasSession$: Subject<boolean> = new Subject();
  role$: Subject<'admin' | 'participant' | 'viewer'> = new Subject();

  state$: Subject<number[] | null> = new Subject();
  restrictTo$: Subject<number[] | null> = new Subject();
  interactable$: Subject<boolean | null> = new Subject();

  // -------------------------------

  constructor(private route: ActivatedRoute) {
    this.app = initializeApp(environment.firebase);

    // clear session when starting
    getAuth()
      .signOut()
      .finally(() => {
        this.subscribeToSession();
        this.subscribeToState();
        this.subscribeToRestrictedTo();
        this.subscribeToInteractable();

        this.resolveParams();
      });
  }

  // -------------------------------

  subscribeToSession() {
    getAuth().onAuthStateChanged((user) => {
      this.hasSession$.next(user !== null);
    });
  }

  subscribeToState() {
    onSnapshot(doc(getFirestore(), 'state', this.pieceId), (snapshot) => {
      if (!snapshot.exists()) {
        this.state$.next(null);
        return;
      }

      const data = snapshot.data();

      const nextState = Object.keys(data)
        .map((key) => ({ key: parseInt(key), value: data[key] }))
        .sort((a, b) => a.key - b.key)
        .map((pair) => pair.value)
        .map((value) => value % 2);

      this.state$.next(nextState);
    });
  }

  subscribeToRestrictedTo() {}

  subscribeToInteractable() {
    onSnapshot(
      doc(getFirestore(), 'interactable', this.pieceId),
      (snapshot) => {
        this.interactable$.next(snapshot.data()?.value ?? false);
      }
    );

    this.interactable$.subscribe((i) => console.log('i:tick', { i }));
  }

  // -------------------------------

  resolveParams() {
    const qp = this.route.snapshot.queryParamMap;
    const key = qp.get('key');

    if (key && key !== undefined) {
      this.onStartSession(key);
    }
  }

  // -------------------------------

  async onStartSession(code: string) {
    // 1. check if valid code
    const ref = doc(getFirestore(), 'sessions', code);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      this.role$.next('viewer');

      // raise alert
      alert("Sorry, that's not a valid code.");

      return;
    }

    // 2. if valid, start anon session
    this.sessionId = code;

    const data = snapshot.data();
    const isAdmin = data?.isAdmin || false;

    try {
      await signInAnonymously(getAuth());
      this.role$.next(isAdmin ? 'admin' : 'participant');
    } catch (err) {
      console.error(err);
      this.role$.next('viewer');
    }
  }

  async onEndSession() {
    try {
      await getAuth().signOut();
      this.role$.next('viewer');
    } catch (err) {
      console.error(err);
    }
  }

  // -------------------------------

  onRandomizeState(n: number = 1024) {
    this.role$
      .pipe(
        take(1),
        filter((role) => ['admin'].includes(role))
      )
      .subscribe((_) => {
        let newState = new Array(n)
          .fill(0)
          .map((_) => (Math.random() > 0.5 ? 1 : 0))
          .reduce((acc, curr, i) => ({ ...acc, [i]: curr }), {});

        setDoc(doc(getFirestore(), 'state', this.pieceId), newState);
      });
  }

  async onSetInteractable(interactable: boolean) {
    console.log('onSetInteractable', { interactable });

    try {
      await setDoc(doc(getFirestore(), 'interactable', this.pieceId), {
        value: interactable,
      });
      console.log('done');
    } catch (err) {
      console.error(err);
    }
  }

  onSetParticipants(n: number = 30) {}

  // -------------------------------

  onSelect(i: number) {
    combineLatest([this.role$, this.interactable$])
      .pipe(
        take(1),
        filter(
          ([role, interactable]) =>
            interactable != null &&
            interactable &&
            ['participant'].includes(role)
        )
      )
      .subscribe((_) => {
        updateDoc(doc(getFirestore(), 'state', this.pieceId), {
          [i.toString()]: increment(1),
        });
      });
  }
}
