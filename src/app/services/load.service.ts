import { Injectable } from "@angular/core";
import { FirebaseService } from "./firebase.service";
import { BehaviorSubject, Observable, from, of } from "rxjs";
import { PuzzleDoc, PuzzleService } from "./puzzle.service";
import { catchError, map, mergeMap } from "rxjs/operators";
import { DocumentReference, QuerySnapshot } from "@angular/fire/firestore";
import { AnswerDoc, AnswerService } from "./answer.service";

@Injectable({
  providedIn: "root",
})
export class LoadService {
  public activePuzzleId$: BehaviorSubject<string> = new BehaviorSubject("");
  private activePuzzleId: string = "";

  constructor(private firebaseService: FirebaseService) {}

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

  public setActiveId(id: string): void {
    this.activePuzzleId = id;
    this.activePuzzleId$.next(id);
  }

  /**
   * Creates new puzzle in the database
   * @param title puzzle title
   * @param width number of columns in puzzle
   * @param height number of rows in puzzle
   * @returns an Observable boolean (true if puzzle created successfully, false otherwise)
   */
  public createPuzzle(title: string, width: number, height: number): Observable<boolean> {
    let newAnswerBank: AnswerDoc = {
      id: "",
      themeAnswers: {},
      answers: [],
    };

    let newPuzzle: PuzzleDoc = {
      id: "",
      name: title,
      width: width,
      height: height,
      answers: Array(width * height).fill(" "),
      spacers: [],
      circles: [],
      shades: [],
      "across-clues": Array(height).fill(""),
      "down-clues": Array(width).fill(""),
    };

    return this.firebaseService.addDoc("puzzle", newPuzzle).pipe(
      map((ref: DocumentReference) => (this.activePuzzleId = ref.id)),
      map(() => this.firebaseService.setDoc("answers", this.activePuzzleId, newAnswerBank)),
      map(() => this.activePuzzleId$.next(this.activePuzzleId)),
      map(() => true),
      catchError(() => of(false))
    );
  }
}
