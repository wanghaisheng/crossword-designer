import { Injectable } from "@angular/core";
import { User, UserCredential, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "@angular/fire/auth";
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  getFirestore,
  QuerySnapshot,
} from "firebase/firestore";
import { Observable, from } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class FirebaseService {
  constructor() {}

  public addDoc(path: string, data: any): Observable<DocumentReference> {
    const db = getFirestore();
    const coll = collection(db, path);

    return from(addDoc(coll, data));
  }

  public updateDoc(path: string, docId: string, data: any): Observable<void> {
    const db = getFirestore();
    const coll = collection(db, path);

    return from(updateDoc(doc(coll, docId), data));
  }

  public setDoc(path: string, docId: string, data: any): Observable<void> {
    const db = getFirestore();
    const coll = collection(db, path);

    return from(setDoc(doc(coll, docId), data));
  }

  public getDoc(path: string, docId: string): Observable<DocumentData | undefined> {
    const db = getFirestore();
    const coll = collection(db, path);

    return from(getDoc(doc(coll, docId))).pipe(map((doc) => doc.data()));
  }

  public getDocs(path: string): Observable<QuerySnapshot<DocumentData>> {
    const db = getFirestore();
    const coll = collection(db, path);

    return from(getDocs(coll));
  }

  public deleteDoc(path: string, docId: string): Observable<void> {
    const db = getFirestore();
    const coll = collection(db, path);

    return from(deleteDoc(doc(coll, docId)));
  }

  public createUser(email: string, password: string): Observable<UserCredential> {
    const auth = getAuth();

    return from(createUserWithEmailAndPassword(auth, email, password));
  }

  public signInUser(email: string, password: string): Observable<UserCredential> {
    const auth = getAuth();

    return from(signInWithEmailAndPassword(auth, email, password));
  }

  public signOutUser(): Observable<void> {
    const auth = getAuth();

    return from(signOut(auth));
  }

  public getCurrentUser(): User | null {
    return getAuth().currentUser;
  }
}
