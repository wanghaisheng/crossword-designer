import { Component, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Clue } from "../clue-list/clue-list.component";

enum EditMode {
  Value,
  Spacer,
  Circle,
}

enum SquareType {
  Letter,
  Spacer,
}
export class Square {
  index: number;
  value: string;
  type: SquareType;
  clueNum: number;
  downClue: boolean;
  acrossClue: boolean;
  circled: boolean;

  constructor(index: number = -1) {
    this.index = index;
    this.value = "";
    this.type = SquareType.Letter;
    this.clueNum = 0;
    this.downClue = false;
    this.acrossClue = false;
    this.circled = false;
  }
}

@Component({
  selector: "app-puzzle-grid",
  templateUrl: "./puzzle-grid.component.html",
  styleUrls: ["./puzzle-grid.component.scss"],
})
export class PuzzleGridComponent implements OnInit {
  public numRows: number = 21;
  public numCols: number = 21;
  public squareHeight: number = 30;

  public editMode: EditMode = EditMode.Value;
  public selectedIndex: number = 0;

  public puzzle: Array<Square> = [];

  public $across: BehaviorSubject<Array<Clue>> = new BehaviorSubject([{ index: 0, clue: "" }]);
  public $down: BehaviorSubject<Array<Clue>> = new BehaviorSubject([{ index: 0, clue: "" }]);
  private acrossClues: Array<Clue> = [];
  private downClues: Array<Clue> = [];

  constructor() {}

  ngOnInit(): void {
    for (let i = 0; i < this.numRows * this.numCols; ++i) {
      this.puzzle.push(new Square(i));
    }
  }

  onClickSquare(index: number) {
    let square = this.puzzle[index];
    let reflectSquare = this.puzzle[this.getReflectIndex(index)];

    if (this.editMode == EditMode.Spacer) {
      this.toggleSquareType(square.index);
    } else if (this.editMode == EditMode.Circle) {
      square.circled = !square.circled;
      square.type = SquareType.Letter;
      reflectSquare.type = SquareType.Letter;
    } else if (this.editMode == EditMode.Value) {
    }

    this.selectedIndex = square.index;
  }

  onKeyDown(event: KeyboardEvent) {
    let square = this.puzzle[this.selectedIndex];

    if (this.isArrowKey(event.key)) {
      this.selectedIndex = this.getNextIndex(square.index, event.key);
    } else if (event.key == "Enter") {
      this.onClickSquare(square.index);
    } else if (event.key == "Backspace") {
      this.setSquareValue(square.index, "");
    } else if (this.isAlphaChar(event.key)) {
      if (square.type == SquareType.Letter) this.setSquareValue(square.index, event.key);
    }
  }

  hideAnswers() {
    // TODO
  }

  numberPuzzle() {
    let num = 1;
    for (let i = 0; i < this.numRows * this.numCols; ++i) {
      let square = this.puzzle[i];
      if (this.setNumber(square.index, num)) num++;
    }

    this.$across.next(this.acrossClues);
    this.$down.next(this.downClues);
  }

  clearGrid() {
    for (let i = 0; i < this.numRows * this.numCols; ++i) {
      let square = this.puzzle[i];
      square.circled = false;
      square.type = SquareType.Letter;
      square.value = "";
      square.clueNum = 0;
    }
  }

  getPuzzleRow(index: number): Array<Square> {
    let rowStart = index - (index % this.numCols);

    return this.puzzle.slice(rowStart, rowStart + this.numCols);
  }

  private getNextIndex(index: number, key: string): number {
    let rowStart = index - (index % this.numCols);
    let rowNum = Math.floor(index / this.numCols);
    let colNum = index % this.numCols;

    if (key == "ArrowDown") {
      return colNum + this.numCols * ((rowNum + 1) % this.numRows);
    } else if (key == "ArrowUp") {
      return colNum + this.numCols * ((rowNum + this.numRows - 1) % this.numRows);
    } else if (key == "ArrowRight") {
      return rowStart + ((colNum + 1) % this.numCols);
    } else if (key == "ArrowLeft") {
      return rowStart + ((colNum + this.numCols - 1) % this.numCols);
    }

    return -1;
  }

  private getReflectIndex(index: number): number {
    return this.numRows * this.numCols - 1 - index;
  }

  private toggleSquareType(index: number): void {
    let square = this.puzzle[index];
    square.type = square.type == SquareType.Letter ? SquareType.Spacer : SquareType.Letter;
    square.circled = false;
    square.value = "";

    let reflectSquare = this.puzzle[this.getReflectIndex(index)];
    reflectSquare.type = square.type;
    reflectSquare.value = "";
  }

  private setSquareValue(index: number, value: string): void {
    let square = this.puzzle[index];
    square.value = value.toUpperCase();
  }

  private setNumber(index: number, num: number): boolean {
    let square = this.puzzle[index];
    let ret = false;

    if (square.type == SquareType.Spacer) return ret;

    if (index < this.numCols || this.puzzle[index - this.numRows].type == SquareType.Spacer) {
      square.clueNum = num;
      square.downClue = true;
      this.downClues.push({ index: num, clue: "Some down clue" });
      ret = true;
    }

    if (index % this.numCols == 0 || this.puzzle[index - 1].type == SquareType.Spacer) {
      square.clueNum = num;
      square.acrossClue = true;
      this.acrossClues.push({ index: num, clue: "Some across clue" });
      ret = true;
    }

    return ret;
  }

  private isAlphaChar(text: string): boolean {
    let char = text.toUpperCase();
    return char.length == 1 && char >= "A" && char <= "Z";
  }

  private isArrowKey(key: string): boolean {
    return ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(key);
  }
}
