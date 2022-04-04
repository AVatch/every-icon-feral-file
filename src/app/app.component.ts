import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from './../environments/environment';

import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  onSnapshot,
  updateDoc,
  increment,
  writeBatch,
  collection,
} from 'firebase/firestore';

import { combineLatest, BehaviorSubject } from 'rxjs';
import { take, filter, distinctUntilChanged } from 'rxjs/operators';

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

  hasSession$: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);
  role$: BehaviorSubject<'admin' | 'participant' | 'viewer'> =
    new BehaviorSubject('viewer' as 'admin' | 'participant' | 'viewer');

  session$: BehaviorSubject<{
    id: string;
    isAdmin: boolean;
    restrictTo: number[];
  } | null> = new BehaviorSubject(
    null as { id: string; isAdmin: boolean; restrictTo: number[] } | null
  );
  sessions$: BehaviorSubject<
    { id: string; isAdmin: boolean; restrictTo: number[] }[] | null
  > = new BehaviorSubject(
    null as { id: string; isAdmin: boolean; restrictTo: number[] }[] | null
  );

  state$: BehaviorSubject<number[] | null> = new BehaviorSubject(
    null as number[] | null
  );
  restrictTo$: BehaviorSubject<number[] | null> = new BehaviorSubject(
    null as number[] | null
  );
  interactable$ = new BehaviorSubject(false);

  // -------------------------------

  constructor(private route: ActivatedRoute, private cd: ChangeDetectorRef) {
    this.app = initializeApp(environment.firebase);

    // clear session when starting
    getAuth()
      .signOut()
      .finally(() => {
        this.subscribeToAuthStateChanged();
        this.subscribeToInteractable();
        this.subscribeToState();

        this.resolveParams();

        this.fetchSessions();
      });
  }

  // -------------------------------

  subscribeToAuthStateChanged() {
    getAuth().onAuthStateChanged((user) => {
      this.hasSession$.next(user !== null);
      if (user === null) {
        this.session$.next(null);
        this.sessions$.next([]);
      }
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

  subscribeToInteractable() {
    onSnapshot(
      doc(getFirestore(), 'interactable', this.pieceId),
      (snapshot) => {
        this.interactable$.next(snapshot.data()?.value ?? false);
      }
    );
  }

  // -------------------------------

  fetchSessions() {
    this.hasSession$
      .pipe(
        filter((hasSession) => hasSession),
        distinctUntilChanged()
      )
      .subscribe(async (_) => {
        if (this.sessionId === null) {
          return;
        }

        const snapshot = await getDocs(
          query(collection(getFirestore(), 'sessions'))
        );

        const data = snapshot.docs
          .filter((s) => s.exists())
          .map(
            (s) =>
              ({ ...s.data(), id: s.id } as {
                id: string;
                isAdmin: boolean;
                restrictTo: number[];
              })
          );

        const mySession = data.find((session) => session.id === this.sessionId);
        const otherSessions = data.filter(
          (session) => session.id !== this.sessionId
        );

        this.session$.next(mySession ?? null);
        this.sessions$.next(otherSessions);
      });
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
      this.hasSession$.next(false);
      this.role$.next('viewer');
      this.session$.next(null);
      this.sessions$.next(null);
      this.restrictTo$.next(null);
      this.interactable$.next(false);
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
    try {
      await setDoc(doc(getFirestore(), 'interactable', this.pieceId), {
        value: interactable,
      });
    } catch (err) {
      console.error(err);
    }
  }

  onSetParticipants(n: number = 30) {
    combineLatest([this.role$, this.sessions$, this.state$])
      .pipe(
        take(1),
        filter(([role]) => ['admin'].includes(role))
      )
      .subscribe(async ([_, sessions, state]) => {
        // Get a new write batch
        const db = getFirestore();
        const batch = writeBatch(db);

        // delete old sessions
        (sessions || []).forEach((session) => {
          const ref = doc(db, 'sessions', session.id);
          batch.delete(ref);
        });

        let availableIndices: number[] = [];
        for (var i = 32; i <= 1023; i++) {
          availableIndices.push(i);
        }

        let perN = Math.floor((32 * 31) / n);

        // create new ones
        Array.from(Array(n)).forEach((_) => {
          const id = doc(collection(db, `/sessions`)).id;
          const ref = doc(db, `/sessions`, id);

          let restrictTo: number[] = [];

          Array.from(Array(perN)).forEach((_) => {
            let i = Math.floor(Math.random() * availableIndices.length);
            restrictTo.push(availableIndices[i]);
            availableIndices.splice(i, 1);
          });

          batch.set(ref, { isAdmin: false, restrictTo });
        });

        // Commit the batch
        try {
          await batch.commit();

          this.fetchSessions();
        } catch (err) {
          console.error(err);
        }
      });
  }

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
      .subscribe(async (_) => {
        if (this.sessionId === null) {
          this.onEndSession();
          return;
        }

        // redundantly check your session
        const ref = doc(getFirestore(), 'sessions', this.sessionId);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) {
          this.onEndSession();
          return;
        }

        updateDoc(doc(getFirestore(), 'state', this.pieceId), {
          [i.toString()]: increment(1),
        });
      });
  }
}
