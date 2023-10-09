import { Injectable } from "@angular/core";
import { PuzzleDoc } from "./puzzle.service";
import { FirebaseService } from "./firebase.service";
import { Observable, from } from "rxjs";
import { catchError } from "rxjs/operators";
import { AnswerDoc } from "./answer.service";

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
  public savePuzzle(docData: PuzzleDoc): Observable<void> {
    return this.firebaseService.setDoc("puzzle", docData.id, docData).pipe(
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
  public saveAnswers(docData: AnswerDoc): Observable<void> {
    return this.firebaseService.setDoc("answers", docData.id, docData).pipe(
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }
}
