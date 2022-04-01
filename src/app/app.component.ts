import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from './../environments/environment';

import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  increment,
} from 'firebase/firestore';

import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  app: FirebaseApp;

  title = 'every-icon';

  sessionId: String | null = null;
  role$: Subject<'admin' | 'participant' | 'viewer'> = new Subject();

  state$: Subject<number[] | null> = new Subject();
  restrictTo$: Subject<number[] | null> = new Subject();

  // -------------------------------

  constructor(private route: ActivatedRoute) {
    this.app = initializeApp(environment.firebase);

    // clear session when starting
    getAuth()
      .signOut()
      .finally(() => {
        this.subscribeToState();
        this.subscribeToRestrictedTo();

        this.resolveParams();
      });
  }

  // -------------------------------

  subscribeToRole() {
    getAuth().onAuthStateChanged((user) => {
      console.log('onAuthStateChanged', { user });
      if (user == null) {
        this.role$.next('viewer');
        return;
      }

      console.log('has session', user.uid);
    });
  }

  subscribeToState() {
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

      this.state$.next(nextState);
    });
  }

  subscribeToRestrictedTo() {}

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
    this.role$.next('viewer');
  }

  // -------------------------------

  onSelect(i: number) {
    updateDoc(doc(getFirestore(), 'state', 'icon'), {
      [i.toString()]: increment(1),
    });
  }
}
