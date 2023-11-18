import { Injectable } from "@angular/core";
import { FirebaseService } from "./firebase.service";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class SaveService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Saves puzzle to the database
   * @param docData data to save
   * @returns an Observable
   */
  public savePuzzle(id: string, docData: any): Observable<void> {
    return (docData?.locked == false ? this.firebaseService.setDoc("puzzle", id, docData) : of(undefined)).pipe(
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  /**
   * Saves answers to the database
   * @param docData data to save
   * @returns an Observable
   */
  public saveAnswers(id: string, docData: any): Observable<void> {
    return this.firebaseService.setDoc("answers", id, docData).pipe(
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }
}
