import { EventEmitter, Injectable } from "@angular/core";
import { BehaviorSubject, from, Observable } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import {
  collection,
  doc,
  DocumentData,
  DocumentSnapshot,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  getFirestore,
  QuerySnapshot,
} from "firebase/firestore";

export interface PuzzleDoc {
  id: string;
  name: string;
  width: number;
  height: number;
  answers: Array<string>;
  spacers: Array<number>;
  circles: Array<number>;
  shades: Array<number>;
  "across-clues": Array<string>;
  "down-clues": Array<string>;
}

export class Puzzle {
  id: string;
  name: string;
  grid: Array<Square>;
  width: number;
  height: number;
  acrossClues: Array<Clue>;
  downClues: Array<Clue>;

  constructor() {
    this.id = "";
    this.name = "";
    this.grid = [];
    this.width = 0;
    this.height = 0;
    this.acrossClues = [];
    this.downClues = [];
  }
}

export class Clue {
  index: number;
  text: string;
  answer: string;
  squares: Array<number>;

  constructor(index: number = -1, clue: string = "", answer: string = "", squares: Array<number> = []) {
    this.index = index;
    this.text = clue;
    this.answer = answer;
    this.squares = squares;
  }
}

export enum ClueType {
  Across,
  Down,
}

export class Square {
  index: number;
  value: string;
  type: SquareType;
  overlay: OverlayType;
  boxNum: number;
  downClueNum: number;
  acrossClueNum: number;

  constructor(
    index: number = -1,
    value: string = " ",
    boxNum: number = -1,
    acrossClueNum: number = -1,
    downClueNum: number = -1,
    type: SquareType = SquareType.Letter,
    overlay: OverlayType = OverlayType.None
  ) {
    this.index = index;
    this.value = value;
    this.boxNum = boxNum;
    this.acrossClueNum = acrossClueNum;
    this.downClueNum = downClueNum;
    this.type = type;
    this.overlay = overlay;
  }
}

export enum SquareType {
  Letter,
  Spacer,
}

export enum OverlayType {
  None,
  Circle,
  Shade,
}

@Injectable({
  providedIn: "root",
})
export class PuzzleService {
  public activePuzzle$: BehaviorSubject<Puzzle> = new BehaviorSubject(new Puzzle());
  public activeAcrossClue$: BehaviorSubject<Clue> = new BehaviorSubject(new Clue());
  public activeDownClue$: BehaviorSubject<Clue> = new BehaviorSubject(new Clue());
  public messenger: EventEmitter<string> = new EventEmitter();

  private activePuzzle: Puzzle;
  constructor() {
    this.activePuzzle = {
      id: "default-id",
      name: "",
      width: 21,
      height: 21,
      grid: [],
      acrossClues: [],
      downClues: [],
    };
  }

  /**
   * Creates a new puzzle in the database
   * @param title puzzle title
   * @param width number of columns in puzzle
   * @param height number of rows in puzzle
   * @returns true if puzzle created successfully, false otherwise
   */
  public createPuzzle(title: string, width: number, height: number): Observable<boolean> {
    const db = getFirestore();
    const puzzles = collection(db, "puzzle");

    let newPuzzle = {
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

    return from(addDoc(puzzles, newPuzzle)).pipe(
      mergeMap((doc) => this.activatePuzzle(doc.id)),
      map(() => {
        return true;
      }),
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
    const db = getFirestore();
    const puzzles = collection(db, "puzzle");

    return from(getDocs(puzzles)).pipe(
      map((snap: QuerySnapshot) => {
        return snap.docs.map((d) => {
          let doc = d.data() as PuzzleDoc;
          doc.id = d.id;
          return doc;
        });
      })
    );
  }

  /**
   * Loads and activates the puzzle with the provided id
   * @param id the puzzle id
   * @returns true if puzzle loaded successfully, false otherwise
   */
  public activatePuzzle(id: string): Observable<boolean> {
    return this.loadPuzzle(id).pipe(
      map((puzzle) => {
        if (puzzle) {
          this.activePuzzle.id = id;
          this.activePuzzle.name = puzzle.name;
          this.activePuzzle.width = puzzle.width;
          this.activePuzzle.height = puzzle.height;
          this.activePuzzle.grid = this.buildGrid(puzzle as PuzzleDoc);
          this.activePuzzle.acrossClues = this.buildAcrossClues(puzzle as PuzzleDoc);
          this.activePuzzle.downClues = this.buildDownClues(puzzle as PuzzleDoc);
          this.numberPuzzle(this.activePuzzle);

          this.activePuzzle$.next(this.activePuzzle);
          this.activeAcrossClue$.next(this.activePuzzle.acrossClues[0]);
          this.activeDownClue$.next(this.activePuzzle.downClues[0]);

          return true;
        }

        return false;
      }),
      catchError((error: ErrorEvent) => {
        throw error;
      })
    );
  }

  /**
   * Saves the active puzzle to the database
   * @returns and Observable
   */
  public savePuzzle(): Observable<void> {
    const db = getFirestore();
    const puzzles = collection(db, "puzzle");

    let puzzle: PuzzleDoc = {
      id: this.activePuzzle.id,
      name: this.activePuzzle.name,
      width: this.activePuzzle.width,
      height: this.activePuzzle.height,
      answers: this.activePuzzle.grid.filter((square: Square) => square.type == SquareType.Letter).map((square: Square) => square.value),
      spacers: this.activePuzzle.grid.filter((square: Square) => square.type == SquareType.Spacer).map((square: Square) => square.index),
      circles: this.activePuzzle.grid
        .filter((square: Square) => square.overlay == OverlayType.Circle)
        .map((square: Square) => square.index),
      shades: this.activePuzzle.grid.filter((square: Square) => square.overlay == OverlayType.Shade).map((square: Square) => square.index),
      "across-clues": this.activePuzzle.acrossClues.map((clue: Clue) => clue.text),
      "down-clues": this.activePuzzle.downClues.map((clue: Clue) => clue.text),
    };

    return from(setDoc(doc(puzzles, this.activePuzzle.id), puzzle));
  }

  /**
   * Clears all squares and renumbers the active puzzle
   */
  public clearPuzzle(): void {
    for (let i = 0; i < this.activePuzzle.height * this.activePuzzle.width; ++i) {
      this.activePuzzle.grid[i] = new Square(i);
    }

    this.activePuzzle.acrossClues = [];
    this.activePuzzle.downClues = [];
    this.numberPuzzle(this.activePuzzle);

    this.messenger.emit("clear");
    this.activePuzzle$.next(this.activePuzzle);
    this.activeAcrossClue$.next(this.activePuzzle.acrossClues[0]);
    this.activeDownClue$.next(this.activePuzzle.downClues[0]);
  }

  /**
   * Updates the active Across and Down clues to those for the square at the provided index
   * @param index square index
   */
  public selectSquare(index: number) {
    this.activeAcrossClue$.next(this.getAcrossClue(index));
    this.activeDownClue$.next(this.getDownClue(index));
  }

  /**
   * Toggles the square at the provided index to Spacer if Letter, and vice versa
   * @param index square index
   */
  public toggleSquareType(index: number): void {
    let square = this.activePuzzle.grid[index];
    let newType = square.type == SquareType.Letter ? SquareType.Spacer : SquareType.Letter;

    this.updateClueLists(index, newType);
    this.setSquareType(index, newType);
    this.numberPuzzle(this.activePuzzle);

    this.activePuzzle$.next(this.activePuzzle);

    if (square.type == SquareType.Letter) {
      this.activeAcrossClue$.next(this.getAcrossClue(index));
      this.activeDownClue$.next(this.getDownClue(index));
    }
  }

  /**
   * Toggles the the square overlay at the provided index to the provided overaly type if None, and vice versa
   * @param index square index
   * @param type
   */
  public toggleSquareOverlay(index: number, type: OverlayType): void {
    let square = this.activePuzzle.grid[index];

    if (square.type == SquareType.Letter) {
      square.overlay = square.overlay == type ? OverlayType.None : type;
      this.activePuzzle$.next(this.activePuzzle);
    }
  }

  /**
   * Sets the square at the provided index to the provided value
   * @param index square index
   * @param value new square value
   */
  public setSquareValue(index: number, value: string): void {
    let square = this.activePuzzle.grid[index];
    let acrossClue = this.getAcrossClue(index);
    let downClue = this.getDownClue(index);

    // Update puzzle grid
    square.value = value.toUpperCase();
    this.activePuzzle$.next(this.activePuzzle);

    // Update across clue answer
    const acrossPos = acrossClue.squares.findIndex((i: number) => i == square.index);
    acrossClue.answer = acrossClue.answer.substring(0, acrossPos) + square.value + acrossClue.answer.substring(acrossPos + 1);
    this.activeAcrossClue$.next(acrossClue);

    // Update down clue answer
    const downPos = downClue.squares.findIndex((i: number) => i == square.index);
    downClue.answer = downClue.answer.substring(0, downPos) + square.value + downClue.answer.substring(downPos + 1);
    this.activeDownClue$.next(downClue);
  }

  /**
   * Sets the across or down clue for the square at the provided index to the provided text
   * @param type the clue type (Across or Down)
   * @param index square index
   * @param text new clue text
   */
  public setClueText(type: ClueType, index: number, text: string) {
    let clues = type == ClueType.Across ? this.activePuzzle.acrossClues : this.activePuzzle.downClues;
    let clue = clues.find((clue) => clue.index == index);

    if (clue) {
      clue.text = text;
    }
  }

  public getRowNum(index: number): number {
    return Math.floor(index / this.activePuzzle.width);
  }

  public getColNum(index: number): number {
    return index % this.activePuzzle.width;
  }

  // TODO: reconfigure tests so we don't need these
  public getActiveGrid(): Array<Square> {
    return this.activePuzzle.grid;
  }
  public getActiveAcross(): Array<Clue> {
    return this.activePuzzle.acrossClues;
  }
  public getActiveDown(): Array<Clue> {
    return this.activePuzzle.downClues;
  }

  public getAcrossClue(index: number): Clue {
    let square = this.activePuzzle.grid[index];
    let across = this.activePuzzle.acrossClues.find((a) => square.acrossClueNum == a.index);

    return across ? across : this.activePuzzle.acrossClues[0];
  }

  public getDownClue(index: number): Clue {
    let square = this.activePuzzle.grid[index];
    let down = this.activePuzzle.downClues.find((d) => square.downClueNum == d.index);

    return down ? down : this.activePuzzle.downClues[0];
  }

  public getReflectIndex(index: number): number {
    return this.activePuzzle.width * this.activePuzzle.height - 1 - index;
  }

  /**
   * Gets the index of the square following the provided index
   * @param index square index
   * @param vertical whether or not the search direction is down
   * @param skipSpacers whether or not to skip spacers
   * @returns the next square index
   */
  public getNextIndex(index: number, vertical: boolean = false, skipSpacers: boolean = false): number {
    let next = index;
    let step = vertical ? this.activePuzzle.width : 1;

    next = (next + step) % (this.activePuzzle.width * this.activePuzzle.height);

    if (skipSpacers) {
      while (this.activePuzzle.grid[next].type == SquareType.Spacer) {
        next = (next + step) % (this.activePuzzle.width * this.activePuzzle.height);
      }
    }

    return next;
  }

  /**
   * Gets the index of the square preceding the provided index
   * @param index square index
   * @param vertical whether or not the search direction is up
   * @param skipSpacers whether or not to skip spacers
   * @returns the previous square index
   */
  public getPrevIndex(index: number, vertical: boolean = false, skipSpacers: boolean = false): number {
    let prev = index;
    let step = vertical ? this.activePuzzle.width : 1;

    prev = (this.activePuzzle.width * this.activePuzzle.height + prev - step) % (this.activePuzzle.width * this.activePuzzle.height);

    if (skipSpacers) {
      while (this.activePuzzle.grid[prev].type == SquareType.Spacer) {
        prev = (this.activePuzzle.width * this.activePuzzle.height + prev - step) % (this.activePuzzle.width * this.activePuzzle.height);
      }
    }

    return prev;
  }

  /**
   * Gets the clue number immediately preceding the square with the provided index
   * @param index square index
   * @returns the clue number
   */
  public getPrevClueNum(index: number): number {
    while (index > 0) {
      if (this.activePuzzle.grid[index].boxNum != -1) {
        return this.activePuzzle.grid[index].boxNum;
      }

      index--;
    }

    return 1;
  }

  /**
   * Determines whether or not the spacer at the provided index creates an across answer
   * @param index Spacer square index
   * @returns the across clue number if true, -1 otherwise
   */
  public createsAcrossNumber(index: number): number {
    let square = this.activePuzzle.grid[index];
    let nextSquare = this.activePuzzle.grid[index + 1];

    if (square.type == SquareType.Spacer && this.getColNum(index) != this.activePuzzle.width - 1 && nextSquare.type == SquareType.Letter) {
      return nextSquare.acrossClueNum;
    }

    return -1;
  }

  /**
   * Determines whether or not the spacer at the provided index creates a down answer
   * @param index Spacer square index
   * @returns the down clue number if true, -1 otherwise
   */
  public createsDownNumber(index: number): number {
    let square = this.activePuzzle.grid[index];
    let nextSquare = this.activePuzzle.grid[index + this.activePuzzle.width];

    if (square.type == SquareType.Spacer && this.getRowNum(index) != this.activePuzzle.height - 1 && nextSquare.type == SquareType.Letter) {
      return nextSquare.downClueNum;
    }

    return -1;
  }

  /**
   * Determines whether or not the spacer at the provided index terminates an across answer
   * @param index Spacer square index
   * @returns the across clue number if true, -1 otherwise
   */
  public terminatesAcrossNumber(index: number): number {
    let square = this.activePuzzle.grid[index];
    let prevSquare = this.activePuzzle.grid[index - 1];

    if (square.type == SquareType.Spacer && this.getColNum(index) != 0 && prevSquare.type == SquareType.Letter) {
      return prevSquare.acrossClueNum;
    }

    return -1;
  }

  /**
   * Determines whether or not the spacer at the provided index terminates a down answer
   * @param index Spacer square index
   * @returns the down clue number if true, -1 otherwise
   */
  public terminatesDownNumber(index: number): number {
    let square = this.activePuzzle.grid[index];
    let prevSquare = this.activePuzzle.grid[index - this.activePuzzle.width];

    if (square.type == SquareType.Spacer && this.getRowNum(index) != 0 && prevSquare.type == SquareType.Letter) {
      return prevSquare.downClueNum;
    }

    return -1;
  }

  /**
   * Determines whether or not the letter square at the provided index starts an across answer
   * @param index Letter square index
   * @returns true or false
   */
  public startsAcross(index: number): boolean {
    let square = this.activePuzzle.grid[index];
    let prevSquare = this.activePuzzle.grid[index - 1];

    if (square.type == SquareType.Letter && (this.getColNum(index) == 0 || prevSquare.type == SquareType.Spacer)) {
      return true;
    }

    return false;
  }

  /**
   * Determines whether or not the letter square at the provided index starts a down answer
   * @param index Letter square index
   * @returns true or false
   */
  public startsDown(index: number): boolean {
    let square = this.activePuzzle.grid[index];
    let prevSquare = this.activePuzzle.grid[index - this.activePuzzle.width];

    if (square.type == SquareType.Letter && (this.getRowNum(index) == 0 || prevSquare.type == SquareType.Spacer)) {
      return true;
    }

    return false;
  }

  /**
   * Determines whether or not the letter square at the provided index ends an across answer
   * @param index Letter square index
   * @returns true or false
   */
  public endsAcross(index: number): boolean {
    let square = this.activePuzzle.grid[index];
    let nextSquare = this.activePuzzle.grid[index + 1];

    if (
      square.type == SquareType.Letter &&
      (this.getColNum(index) == this.activePuzzle.width - 1 || nextSquare.type == SquareType.Spacer)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Determines whether or not the letter square at the provided index ends a down answer
   * @param index Letter square index
   * @returns true or false
   */
  public endsDown(index: number): boolean {
    let square = this.activePuzzle.grid[index];
    let nextSquare = this.activePuzzle.grid[index + this.activePuzzle.width];

    if (
      square.type == SquareType.Letter &&
      (this.getRowNum(index) == this.activePuzzle.height - 1 || nextSquare.type == SquareType.Spacer)
    ) {
      return true;
    }

    return false;
  }

  public isPuzzleStart(index: number): boolean {
    return index <= 0;
  }

  public isPuzzleEnd(index: number): boolean {
    return index >= this.activePuzzle.width * this.activePuzzle.height - 1;
  }

  private setSquareType(index: number, type: SquareType) {
    let square = this.activePuzzle.grid[index];
    let reflectSquare = this.activePuzzle.grid[this.getReflectIndex(index)];

    square.type = reflectSquare.type = type;
    square.value = reflectSquare.value = type == SquareType.Letter ? " " : "";
    square.boxNum = reflectSquare.boxNum = -1;
  }

  private numberPuzzle(puzzle: Puzzle, start: number = 0): void {
    let num = 1;
    let acrossCount = 0;
    let downCount = 0;
    let size = this.activePuzzle.height * this.activePuzzle.width;

    let across: { num: number; ans: string; pos: number; squares: Array<number> } = { num: 1, ans: "", pos: 0, squares: [] };
    let down: Array<{ num: number; ans: string; pos: number; squares: Array<number> }> = Array.from(
      { length: this.activePuzzle.width },
      () => {
        return { num: 1, ans: "", pos: 0, squares: [] };
      }
    );

    for (let i = start; i < size; ++i) {
      let square = puzzle.grid[i];
      let colNum = this.getColNum(square.index);

      // Set Spacer
      if (square.type == SquareType.Spacer) {
        square.boxNum = -1;
        square.acrossClueNum = -1;
        square.downClueNum = -1;
        continue;
      }

      // Set Letter
      if (this.startsAcross(square.index) || this.startsDown(square.index)) {
        if (this.startsAcross(square.index)) {
          across.num = num;
          across.pos = acrossCount++;
        }

        if (this.startsDown(square.index)) {
          down[colNum].num = num;
          down[colNum].pos = downCount++;
        }

        square.boxNum = num++;
      } else {
        square.boxNum = -1;
      }

      // Track across clue data
      square.acrossClueNum = across.num;
      across.ans += square.value;
      across.squares.push(square.index);

      // Track down clue data
      square.downClueNum = down[colNum].num;
      down[colNum].ans += square.value;
      down[colNum].squares.push(square.index);

      // Associate answers with clues
      if (this.endsAcross(square.index)) {
        this.addOrUpdateClue(puzzle.acrossClues, across.pos, square.acrossClueNum, across.ans, across.squares);
        across.ans = "";
        across.squares = [];
      }

      if (this.endsDown(square.index)) {
        this.addOrUpdateClue(puzzle.downClues, down[colNum].pos, square.downClueNum, down[colNum].ans, down[colNum].squares);
        down[colNum].ans = "";
        down[colNum].squares = [];
      }
    }

    // Ensure down clues are in order
    puzzle.downClues.sort((a: Clue, b: Clue) => a.index - b.index);
  }

  // TODO: this should be private but making it public makes testing not a complete nightmare
  public loadPuzzle(id: string): Observable<DocumentData | undefined> {
    const db = getFirestore();
    const puzzles = collection(db, "puzzle");

    return from(getDoc(doc(puzzles, id))).pipe(
      map((doc: DocumentSnapshot<DocumentData>) => {
        return doc.data();
      })
    );
  }

  private addOrUpdateClue(clues: Array<Clue>, pos: number, clueNum: number, answer: string, squares: Array<number>): void {
    let clue = clues[pos];

    if (clue) {
      clue.index = clueNum;
      clue.answer = answer;
      clue.squares = squares;
    } else {
      const buffer = Array.from({ length: pos - clues.length }, () => new Clue());
      clues.splice(pos, 0, ...buffer, new Clue(clueNum, "", answer, squares));
    }
  }

  private updateClueLists(updatedIndex: number, newType: SquareType) {
    let updatedSquare = this.activePuzzle.grid[updatedIndex];
    let reflectSquare = this.activePuzzle.grid[this.getReflectIndex(updatedIndex)];

    let addClues = (square: Square) => {
      if (newType == SquareType.Spacer) {
        let acrossPos = this.activePuzzle.acrossClues.findIndex((clue: Clue) => clue.index == square.acrossClueNum);
        let downPos = this.activePuzzle.downClues.findIndex((clue: Clue) => clue.index == square.downClueNum);

        // Reset clue text for existing clues
        this.activePuzzle.acrossClues[acrossPos].text = "";
        this.activePuzzle.downClues[downPos].text = "";

        if (!this.endsAcross(square.index)) {
          if (this.startsAcross(square.index)) {
            // Remove old across clue
            this.activePuzzle.acrossClues.splice(acrossPos, 1);
          }

          // Add new across clue
          this.activePuzzle.acrossClues.splice(acrossPos + 1, 0, new Clue());
        }

        if (!this.endsDown(square.index)) {
          if (this.startsDown(square.index)) {
            // Remove old down clue
            this.activePuzzle.downClues.splice(downPos, 1);
          }

          // Add new down clue
          let prevClueNum = this.getPrevClueNum(square.index + this.activePuzzle.width);
          downPos = this.activePuzzle.downClues.findIndex((clue: Clue) => clue.index > prevClueNum);
          this.activePuzzle.downClues.splice(downPos, 0, new Clue());
        }
      } else {
        let createdAcross = this.createsAcrossNumber(square.index);
        let createdDown = this.createsDownNumber(square.index);

        if (createdAcross != -1) {
          let acrossPos = this.activePuzzle.acrossClues.findIndex((clue: Clue) => clue.index == createdAcross);
          let terminatedAcross = this.terminatesAcrossNumber(square.index);

          // Remove old across clue
          this.activePuzzle.acrossClues.splice(acrossPos, 1);

          if (terminatedAcross == -1) {
            // Add new across clue
            this.activePuzzle.acrossClues.splice(acrossPos, 0, new Clue());
          } else {
            // Reset clue text for existing across clue
            acrossPos = this.activePuzzle.acrossClues.findIndex((clue: Clue) => clue.index == terminatedAcross);
            this.activePuzzle.acrossClues[acrossPos].text = "";
          }
        }

        if (createdDown != -1) {
          let downPos = this.activePuzzle.downClues.findIndex((clue: Clue) => clue.index == createdDown);
          let terminatedDown = this.terminatesDownNumber(square.index);

          // Remove old down clue
          this.activePuzzle.downClues.splice(downPos, 1);

          if (terminatedDown == -1) {
            // Add new down clue
            let prevClueNum = this.getPrevClueNum(square.index);
            downPos = this.activePuzzle.downClues.findIndex((clue: Clue) => clue.index > prevClueNum);
            this.activePuzzle.downClues.splice(downPos, 0, new Clue());
          } else {
            // Reset clue text for existing down clue
            downPos = this.activePuzzle.downClues.findIndex((clue: Clue) => clue.index == terminatedDown);
            this.activePuzzle.downClues[downPos].text = "";
          }
        }
      }
    };

    addClues(updatedSquare);
    addClues(reflectSquare);
  }

  private buildGrid(puzzle: PuzzleDoc): Array<Square> {
    let answersPos = 0;
    let grid = [];

    for (let i = 0; i < puzzle.width * puzzle.height; i++) {
      let square = new Square(i);

      if (puzzle.spacers.includes(i)) {
        square.type = SquareType.Spacer;
        square.value = "";
      } else {
        if (puzzle.circles.includes(i)) {
          square.overlay = OverlayType.Circle;
        }

        if (puzzle.shades.includes(i)) {
          square.overlay = OverlayType.Shade;
        }

        square.value = puzzle.answers[answersPos++].toUpperCase();
      }

      grid.push(square);
    }

    return grid;
  }

  private buildAcrossClues(puzzle: PuzzleDoc): Array<Clue> {
    let clues: Array<Clue> = [];

    puzzle["across-clues"].map((clueText: string) => {
      clues.push(new Clue(0, clueText, ""));
    });

    return clues;
  }

  private buildDownClues(puzzle: PuzzleDoc): Array<Clue> {
    let clues: Array<Clue> = [];

    puzzle["down-clues"].map((clueText: string) => {
      clues.push(new Clue(0, clueText, ""));
    });

    return clues;
  }
}
