import { Injectable } from "@angular/core";
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  getFirestore,
  QuerySnapshot,
} from "firebase/firestore";
import { Observable, from, of } from "rxjs";
import { map, mergeMap } from "rxjs/operators";

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
}
