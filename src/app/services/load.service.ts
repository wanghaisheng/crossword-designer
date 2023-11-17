import { Injectable } from "@angular/core";
import { FirebaseService } from "./firebase.service";
import { BehaviorSubject, Observable, from, of } from "rxjs";
import { PuzzleDoc, PuzzleService } from "./puzzle.service";
import { catchError, map, switchMap } from "rxjs/operators";
import { DocumentData, DocumentReference, QuerySnapshot } from "@angular/fire/firestore";
import { AnswerDoc, AnswerService } from "./answer.service";

export interface Patch {
  locked?: boolean;
  name?: string;
  width?: number;
  height?: number;
}

@Injectable({
  providedIn: "root",
})
export class LoadService {
  public activePuzzleId$: BehaviorSubject<string> = new BehaviorSubject("");
  private _activePuzzleId: string = "";
  private _puzzleList: Array<PuzzleDoc> = [];

  constructor(private firebaseService: FirebaseService, private answerService: AnswerService, private puzzleService: PuzzleService) {}

  /**
   * Retrieves a list of puzzles from the database
   * @returns an Observable containing an Array of PuzzleDocs
   */
  public getPuzzleList(): Observable<Array<PuzzleDoc>> {
    // TODO: periodically check for updates
    if (this._puzzleList.length > 0) {
      return of(this._puzzleList);
    }

    return from(this.firebaseService.getDocs("puzzle")).pipe(
      map((snap: QuerySnapshot) => {
        return snap.docs.map((d) => {
          let doc = d.data() as PuzzleDoc;
          doc.id = d.id;
          return doc;
        });
      }),
      map((puzzles: Array<PuzzleDoc>) => (this._puzzleList = puzzles)),
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  public setActiveId(id: string): void {
    if (id) {
      this._activePuzzleId = id;
      this.activePuzzleId$.next(id);
    }
  }

  /**
   * Creates and loads new puzzle from the database
   * @param title puzzle title
   * @param width number of columns in puzzle
   * @param height number of rows in puzzle
   * @returns an Observable
   */
  public createPuzzle(title: string, width: number, height: number): Observable<void> {
    let newAnswerBank: AnswerDoc = {
      id: "",
      themeAnswers: {},
      answers: [],
    };

    let newPuzzle: PuzzleDoc = {
      id: "",
      name: title,
      createdBy: this.firebaseService.getCurrentUser()?.uid || "",
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
      map((ref: DocumentReference) => {
        newAnswerBank.id = ref.id;
        this.firebaseService.updateDoc("puzzle", ref.id, { id: ref.id });
      }),
      map(() => this.firebaseService.setDoc("answers", newAnswerBank.id, newAnswerBank)),
      switchMap(() => this.loadPuzzle(newAnswerBank.id)),
      map(() => {
        // Add new puzzle doc to list
        newPuzzle.id = newAnswerBank.id;
        this._puzzleList.push(newPuzzle);
      }),
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  /**
   * Loads puzzle with the provided id from the database
   * @param id puzzle id
   * @returns an Observable
   */
  public loadPuzzle(id: string): Observable<void> {
    return this.firebaseService.getDoc("puzzle", id).pipe(
      map((docData: DocumentData | undefined) => docData && this.puzzleService.activatePuzzle(docData as PuzzleDoc)),
      switchMap(() => this.firebaseService.getDoc("answers", id)),
      map((docData: DocumentData | undefined) => docData && this.answerService.activateAnswers(docData as AnswerDoc)),
      map(() => this.setActiveId(id)),
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
  public updatePuzzle(id: string, data: Patch): Observable<void> {
    return this.firebaseService.updateDoc("puzzle", id, data).pipe(
      map(() => {
        // Update active puzzle if needed
        if (id == this._activePuzzleId && data.locked != undefined) {
          this.puzzleService.locked = data.locked;
        }
      }),
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
