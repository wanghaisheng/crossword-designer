import { EventEmitter, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { TestPuzzle } from "src/environments/environment";

export interface Puzzle {
  id: string;
  name: string;
  grid: Array<Square>;
  acrossClues: Array<Clue>;
  downClues: Array<Clue>;
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
    type: SquareType = SquareType.Letter
  ) {
    this.index = index;
    this.value = value;
    this.boxNum = boxNum;
    this.acrossClueNum = acrossClueNum;
    this.downClueNum = downClueNum;
    this.type = type;
    this.overlay = OverlayType.None;
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
  public $activeGrid: BehaviorSubject<Array<Square>> = new BehaviorSubject([new Square()]);
  public $activeAcrossClue: BehaviorSubject<Clue> = new BehaviorSubject(new Clue());
  public $activeDownClue: BehaviorSubject<Clue> = new BehaviorSubject(new Clue());
  public messenger: EventEmitter<string> = new EventEmitter();

  private activePuzzle: Puzzle;
  private numCols: number = 21;
  private numRows: number = 21;

  constructor() {
    this.activePuzzle = {
      id: "default-id",
      name: "",
      grid: [],
      acrossClues: [],
      downClues: [],
    };
  }

  public createPuzzle(size: number) {
    // TODO: create unique id service to generate id
    this.activePuzzle.id = "new-puzzle";
    this.activePuzzle.name = "New Puzzle";
    this.buildGrid(size, Array(size * size + 1).join(" "), [], [], []);
    this.numberPuzzle();
    this.activatePuzzle();
  }

  public activatePuzzle(id?: string) {
    if (id) {
      this.loadPuzzle(id);
    }

    this.$activeGrid.next(this.activePuzzle.grid);
    this.$activeAcrossClue.next(this.activePuzzle.acrossClues[0]);
    this.$activeDownClue.next(this.activePuzzle.downClues[0]);
  }

  public savePuzzle() {
    // TODO: save to database
    this.messenger.emit("save");
    console.log(this.activePuzzle.acrossClues);
    console.log(this.activePuzzle.downClues);
    console.log(this.activePuzzle.grid);
  }

  public clearPuzzle(): void {
    for (let i = 0; i < this.numRows * this.numCols; ++i) {
      this.activePuzzle.grid[i] = new Square(i);
    }

    this.activePuzzle.acrossClues = [];
    this.activePuzzle.downClues = [];
    this.numberPuzzle();

    this.messenger.emit("clear");
    this.$activeGrid.next(this.activePuzzle.grid);
    this.$activeAcrossClue.next(this.activePuzzle.acrossClues[0]);
    this.$activeDownClue.next(this.activePuzzle.downClues[0]);
  }

  public selectSquare(index: number) {
    this.$activeAcrossClue.next(this.getAcrossClue(index));
    this.$activeDownClue.next(this.getDownClue(index));
  }

  public toggleSquareType(index: number): void {
    let square = this.activePuzzle.grid[index];
    let acrossPos = this.activePuzzle.acrossClues.findIndex((clue: Clue) => clue.index == square.acrossClueNum);
    let downPos = this.activePuzzle.downClues.findIndex((clue: Clue) => clue.index == square.downClueNum);

    this.setSquareType(index, square.type == SquareType.Letter ? SquareType.Spacer : SquareType.Letter);

    if (square.type == SquareType.Spacer) {
      this.activePuzzle.acrossClues[acrossPos].text = "";
      this.activePuzzle.downClues[downPos].text = "";

      // Add new clues to clue list
      if (!this.isAcrossEnd(index)) {
        this.activePuzzle.acrossClues.splice(acrossPos, 0, new Clue());
      }

      if (!this.isDownEnd(index)) {
        let prevClueNum = Math.max(
          this.activePuzzle.grid[index + this.numCols].acrossClueNum,
          this.activePuzzle.grid[index + this.numCols - 1].downClueNum
        );

        downPos = this.activePuzzle.downClues.findIndex((clue: Clue) => clue.index > prevClueNum);
        this.activePuzzle.downClues.splice(downPos, 0, new Clue());
      }
    } else {
      acrossPos = this.activePuzzle.acrossClues.findIndex((clue: Clue) => clue.index == this.activePuzzle.grid[index + 1].acrossClueNum);
      downPos = this.activePuzzle.downClues.findIndex(
        (clue: Clue) => clue.index == this.activePuzzle.grid[index + this.numCols].downClueNum
      );

      if (!this.isAcrossEnd(index)) {
        this.activePuzzle.acrossClues.splice(acrossPos, 1);
      }

      if (!this.isDownEnd(index)) {
        this.activePuzzle.downClues.splice(downPos, 1);
      }
    }

    this.numberPuzzle();
    this.$activeGrid.next(this.activePuzzle.grid);

    if (square.type == SquareType.Letter) {
      this.$activeAcrossClue.next(this.getAcrossClue(index));
      this.$activeDownClue.next(this.getDownClue(index));
    }
  }

  public toggleSquareOverlay(index: number, type: OverlayType): void {
    let square = this.activePuzzle.grid[index];

    square.type = SquareType.Letter;
    square.overlay = square.overlay == type ? OverlayType.None : type;
    this.$activeGrid.next(this.activePuzzle.grid);
  }

  public getRowNum(index: number): number {
    return Math.floor(index / this.numCols);
  }

  public getColNum(index: number): number {
    return index % this.numCols;
  }

  public getActiveGrid(): Array<Square> {
    return this.activePuzzle.grid;
  }

  public getActiveAcross(): Array<Clue> {
    return this.activePuzzle.acrossClues;
  }

  public getActiveDown(): Array<Clue> {
    return this.activePuzzle.downClues;
  }

  public setSquareValue(index: number, value: string): void {
    let square = this.activePuzzle.grid[index];
    let acrossClue = this.getAcrossClue(index);
    let downClue = this.getDownClue(index);

    // Update puzzle grid
    square.value = value.toUpperCase();
    this.$activeGrid.next(this.activePuzzle.grid);

    // Update across clue answer
    const acrossPos = acrossClue.squares.findIndex((i: number) => i == square.index);
    acrossClue.answer = acrossClue.answer.substring(0, acrossPos) + square.value + acrossClue.answer.substring(acrossPos + 1);
    this.$activeAcrossClue.next(acrossClue);

    // Update down clue answer
    const downPos = downClue.squares.findIndex((i: number) => i == square.index);
    downClue.answer = downClue.answer.substring(0, downPos) + square.value + downClue.answer.substring(downPos + 1);
    this.$activeDownClue.next(downClue);
  }

  public setClueText(type: ClueType, index: number, text: string) {
    let clues = type == ClueType.Across ? this.activePuzzle.acrossClues : this.activePuzzle.downClues;
    let clue = clues.find((clue) => clue.index == index);

    if (clue) {
      clue.text = text;
    }
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
    return this.numRows * this.numCols - 1 - index;
  }

  public getNextIndex(index: number, vertical: boolean = false, skipSpacers: boolean = false): number {
    let next = index;
    let step = vertical ? this.numCols : 1;

    next = (next + step) % (this.numRows * this.numCols);

    if (skipSpacers) {
      while (this.activePuzzle.grid[next].type == SquareType.Spacer) {
        next = (next + step) % (this.numRows * this.numCols);
      }
    }

    return next;
  }

  public getPrevIndex(index: number, vertical: boolean = false, skipSpacers: boolean = false): number {
    let prev = index;
    let step = vertical ? this.numCols : 1;

    prev = (this.numRows * this.numCols + prev - step) % (this.numRows * this.numCols);

    if (skipSpacers) {
      while (this.activePuzzle.grid[prev].type == SquareType.Spacer) {
        prev = (this.numRows * this.numCols + prev - step) % (this.numRows * this.numCols);
      }
    }

    return prev;
  }

  public isAcrossStart(index: number): boolean {
    let square = this.activePuzzle.grid[index];
    let nextSquare = this.activePuzzle.grid[index - 1];

    if (square.type == SquareType.Letter && (index % this.numCols == 0 || nextSquare.type == SquareType.Spacer)) {
      return true;
    }

    return false;
  }

  public isDownStart(index: number): boolean {
    let square = this.activePuzzle.grid[index];
    let nextSquare = this.activePuzzle.grid[index - this.numRows];

    if (square.type == SquareType.Letter && (index < this.numCols || nextSquare.type == SquareType.Spacer)) {
      return true;
    }

    return false;
  }

  public isAcrossEnd(index: number): boolean {
    let square = this.activePuzzle.grid[index];
    let nextSquare = this.activePuzzle.grid[index + 1];

    if (square.type == SquareType.Letter && (index % this.numCols == this.numCols - 1 || nextSquare.type == SquareType.Spacer)) {
      return true;
    }

    return false;
  }

  public isDownEnd(index: number): boolean {
    let square = this.activePuzzle.grid[index];
    let nextSquare = this.activePuzzle.grid[index + this.numCols];

    if (
      square.type == SquareType.Letter &&
      (Math.floor(index / this.numCols) == this.numRows - 1 || nextSquare.type == SquareType.Spacer)
    ) {
      return true;
    }

    return false;
  }

  public isPuzzleStart(index: number): boolean {
    return index <= 0;
  }

  public isPuzzleEnd(index: number): boolean {
    return index >= this.numRows * this.numCols - 1;
  }

  private setSquareType(index: number, type: SquareType) {
    let square = this.activePuzzle.grid[index];
    let reflectSquare = this.activePuzzle.grid[this.getReflectIndex(index)];

    square.type = reflectSquare.type = type;
    square.value = reflectSquare.value = type == SquareType.Letter ? " " : "";
    square.boxNum = reflectSquare.boxNum = -1;
  }

  private numberPuzzle(start: number = 0): void {
    let num = 1;
    let acrossCount = 0;
    let downCount = 0;

    let across: { num: number; ans: string; pos: number; squares: Array<number> } = { num: 1, ans: "", pos: 0, squares: [] };
    let down: Array<{ num: number; ans: string; pos: number; squares: Array<number> }> = Array.from({ length: this.numCols }, () => {
      return { num: 1, ans: "", pos: 0, squares: [] };
    });

    for (let i = start; i < this.numRows * this.numCols; ++i) {
      let square = this.activePuzzle.grid[i];
      let colNum = this.getColNum(square.index);

      // Set Spacer
      if (square.type == SquareType.Spacer) {
        square.boxNum = -1;
        square.acrossClueNum = -1;
        square.downClueNum = -1;
        continue;
      }

      // Set Letter
      if (this.isAcrossStart(square.index) || this.isDownStart(square.index)) {
        if (this.isAcrossStart(square.index)) {
          across.num = num;
          across.pos = acrossCount++;
        }

        if (this.isDownStart(square.index)) {
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
      if (this.isAcrossEnd(square.index)) {
        this.addOrUpdateClue(this.activePuzzle.acrossClues, across.pos, square.acrossClueNum, across.ans, across.squares);
        across.ans = "";
        across.squares = [];
      }

      if (this.isDownEnd(square.index)) {
        this.addOrUpdateClue(this.activePuzzle.downClues, down[colNum].pos, square.downClueNum, down[colNum].ans, down[colNum].squares);
        down[colNum].ans = "";
        down[colNum].squares = [];
      }
    }

    // Ensure down clues are in order
    this.activePuzzle.downClues.sort((a: Clue, b: Clue) => a.index - b.index);
  }

  private loadPuzzle(id: string): void {
    let size = 21;
    let name = "New Puzzle";
    let answers = "";
    let spacers: Array<number> = [];
    let circles: Array<number> = [];
    let shades: Array<number> = [];
    let acrossClues: Array<string> = [];
    let downClues: Array<string> = [];

    if (id == "test") {
      name = TestPuzzle.name;
      size = TestPuzzle.size;
      answers = TestPuzzle.answerString;
      spacers = TestPuzzle.spacerIndeces;
      circles = TestPuzzle.circleIndeces;
      shades = TestPuzzle.shadeIndeces;
      acrossClues = TestPuzzle.acrossClues;
      downClues = TestPuzzle.downClues;
    } else {
      // TODO: load from database
    }

    this.activePuzzle.id = id;
    this.activePuzzle.name = name;
    this.buildGrid(size, answers, spacers, circles, shades);
    this.buildClues(acrossClues, downClues);
    this.numberPuzzle();
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

  private buildGrid(size: number, answers: string, spacers: Array<number>, circles: Array<number>, shades: Array<number>): void {
    let stringPos = 0;

    for (let i = 0; i < size * size; i++) {
      let square = new Square(i);

      if (spacers.includes(i)) {
        square.type = SquareType.Spacer;
        square.value = "";
      } else {
        if (circles.includes(i)) {
          square.overlay = OverlayType.Circle;
        }

        if (shades.includes(i)) {
          square.overlay = OverlayType.Shade;
        }

        square.value = answers[stringPos++].toUpperCase();
      }

      this.activePuzzle.grid.push(square);
    }
  }

  private buildClues(acrossClues: Array<string>, downClues: Array<string>): void {
    acrossClues.map((clueText: string, i: number) => {
      this.activePuzzle.acrossClues.push(new Clue(0, clueText, ""));
    });
    downClues.map((clueText: string, i: number) => {
      this.activePuzzle.downClues.push(new Clue(0, clueText, ""));
    });
  }
}
