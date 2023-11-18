import { Injectable } from "@angular/core";
import { FirebaseService } from "./firebase.service";
import { BehaviorSubject, Observable, from } from "rxjs";
import { PuzzleDoc } from "./puzzle.service";
import { catchError, map, switchMap } from "rxjs/operators";
import { DocumentData, DocumentReference, DocumentSnapshot, QuerySnapshot } from "@angular/fire/firestore";
import { AnswerDoc } from "./answer.service";

@Injectable({
  providedIn: "root",
})
export class LoadService {
  public activePuzzleId$: BehaviorSubject<string> = new BehaviorSubject("");
  public activePuzzlePatch$: BehaviorSubject<Partial<PuzzleDoc>> = new BehaviorSubject({});
  private _activePuzzleId: string = "";

  constructor(private firebaseService: FirebaseService) {}

  public setActiveId(id: string): void {
    this._activePuzzleId = id;
    this.activePuzzleId$.next(id);
  }

  /**
   * Creates and loads new puzzle from the database
   * @param title puzzle title
   * @param width number of columns in puzzle
   * @param height number of rows in puzzle
   * @returns an Observable
   */
  public createPuzzle(title: string, width: number, height: number): Observable<void> {
    let newAnswerBank = {
      themeAnswers: {},
      answers: [],
    };

    let newPuzzle = {
      name: title,
      createdBy: this.firebaseService.getCurrentUser()?.uid,
      width: width,
      height: height,
      locked: false,
      answers: Array(width * height).fill(" "),
      spacers: [],
      circles: [],
      shades: [],
      "across-clues": Array(height).fill(""),
      "down-clues": Array(width).fill(""),
    };

    return this.firebaseService.addDoc("puzzle", newPuzzle).pipe(
      switchMap((docRef: DocumentReference<DocumentData>) =>
        this.firebaseService.setDoc("answers", docRef.id, newAnswerBank).pipe(map(() => docRef.id))
      ),
      map((docId: string) => this.setActiveId(docId)),
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  /**
   * Retrieves a list of puzzles from the database
   * @returns an Observable containing an Array of PuzzleDocs
   */
  public getPuzzleList(): Observable<Array<PuzzleDoc>> {
    return from(this.firebaseService.getDocs("puzzle")).pipe(
      map((snap: QuerySnapshot) => {
        return snap.docs.map((d) => {
          let doc = d.data() as PuzzleDoc;
          doc.id = d.id;
          return doc;
        });
      }),
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  /**
   * Retrieves puzzle with the provided id from the database
   * @param id puzzle id
   * @returns an Observable
   */
  public getPuzzle(id: string): Observable<PuzzleDoc> {
    return this.firebaseService.getDoc("puzzle", id).pipe(
      map((doc: DocumentSnapshot) => {
        return {
          id: doc.id,
          ...doc.data(),
        } as PuzzleDoc;
      }),
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  /**
   * Loads answers with the provided id from the database
   * @param id puzzle id
   * @returns an Observable
   */
  public getAnswers(id: string): Observable<AnswerDoc> {
    return this.firebaseService.getDoc("answers", id).pipe(
      map((doc: DocumentSnapshot) => {
        return {
          id: doc.id,
          ...doc.data(),
        } as AnswerDoc;
      }),
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  /**
   * Update puzzle with the provided id in the database
   * @param id puzzle id
   * @param data updated field data
   * @returns an Observable
   */
  public updatePuzzle(id: string, data: Partial<PuzzleDoc>): Observable<void> {
    return this.firebaseService.updateDoc("puzzle", id, data).pipe(
      map(() => (id == this._activePuzzleId ? this.activePuzzlePatch$.next(data) : undefined)),
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  /**
   * Delete puzzle with the provided id in the database
   * @param id puzzle id
   * @returns an Observable
   */
  public deletePuzzle(id: string): Observable<void> {
    return this.firebaseService.deleteDoc("puzzle", id).pipe(
      switchMap(() => this.firebaseService.deleteDoc("answers", id)),
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }
}
