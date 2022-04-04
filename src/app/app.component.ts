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

import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
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
    restrictedTo: number[];
  } | null> = new BehaviorSubject(
    null as { id: string; isAdmin: boolean; restrictedTo: number[] } | null
  );
  sessions$: BehaviorSubject<
    { id: string; isAdmin: boolean; restrictedTo: number[] }[] | null
  > = new BehaviorSubject(
    null as { id: string; isAdmin: boolean; restrictedTo: number[] }[] | null
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
        this.subscribeToSession();
        this.subscribeToInteractable();
        this.subscribeToRestrictedTo();
        this.subscribeToState();

        this.resolveParams();

        this.fetchSessions();
      });
  }

  // -------------------------------

  subscribeToSession() {
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

  subscribeToRestrictedTo() {}

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
        console.log('ping');

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
                restrictedTo: number[];
              })
          );

        const mySession = data.find((session) => session.id === this.sessionId);
        const otherSessions = data.filter(
          (session) => session.id !== this.sessionId
        );

        console.log({ mySession, otherSessions });
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
    try {
      await setDoc(doc(getFirestore(), 'interactable', this.pieceId), {
        value: interactable,
      });
    } catch (err) {
      console.error(err);
    }
  }

  onSetParticipants(n: number = 30) {
    combineLatest([this.role$, this.sessions$])
      .pipe(
        take(1),
        filter(([role]) => ['admin'].includes(role))
      )
      .subscribe(async ([_, sessions]) => {
        // Get a new write batch
        const db = getFirestore();
        const batch = writeBatch(db);

        // delete old sessions
        (sessions || []).forEach((session) => {
          const ref = doc(db, 'sessions', session.id);
          batch.delete(ref);
        });

        // create new ones
        Array.from(Array(n)).forEach((_) => {
          const id = doc(collection(db, `/sessions`)).id;
          const ref = doc(db, `/sessions`, id);
          batch.set(ref, { isAdmin: false, restrictedTo: [] });
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
      .subscribe((_) => {
        updateDoc(doc(getFirestore(), 'state', this.pieceId), {
          [i.toString()]: increment(1),
        });
      });
  }
}
