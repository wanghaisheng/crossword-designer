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

  public grid: Array<Array<Square>> = [];

  public $across: BehaviorSubject<Array<Clue>> = new BehaviorSubject([{ index: 0, clue: "" }]);
  public $down: BehaviorSubject<Array<Clue>> = new BehaviorSubject([{ index: 0, clue: "" }]);
  private acrossClues: Array<Clue> = [];
  private downClues: Array<Clue> = [];

  constructor() {}

  ngOnInit(): void {
    for (let i = 0; i < this.numRows; ++i) {
      let row = [];
      for (let j = 0; j < this.numCols; ++j) {
        row.push(new Square(i * this.numRows + j));
      }

      this.grid.push(row);
    }
  }

  onClickSquare(index: number) {
    let row = this.getRow(index);
    let col = this.getCol(index);

    let square = this.grid[row][col];
    let reflectSquare = this.grid[this.numRows - 1 - row][this.numCols - 1 - col];

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
    let square = this.grid[this.getRow(this.selectedIndex)][this.getCol(this.selectedIndex)];

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
    for (let i = 0; i < this.numRows; ++i) {
      for (let j = 0; j < this.numCols; ++j) {
        let square = this.grid[i][j];
        if (this.setNumber(square.index, num)) num++;
      }
    }

    this.$across.next(this.acrossClues);
    this.$down.next(this.downClues);
  }

  clearGrid() {
    for (let i = 0; i < this.numRows; ++i) {
      for (let j = 0; j < this.numCols; ++j) {
        let square = this.grid[i][j];
        square.circled = false;
        square.type = SquareType.Letter;
        square.value = "";
        square.clueNum = 0;
      }
    }
  }

  private getNextIndex(index: number, key: string): number {
    let row = this.getRow(index);
    let col = this.getCol(index);

    if (key == "ArrowDown") {
      return ((row + 1) % this.numRows) * this.numCols + col;
    } else if (key == "ArrowUp") {
      return row - 1 > -1 ? this.numRows * (row - 1) + col : this.numRows * (this.numRows - 1) + col;
    } else if (key == "ArrowRight") {
      return ((col + 1) % this.numCols) + this.numRows * row;
    } else if (key == "ArrowLeft") {
      return col - 1 > -1 ? this.numRows * row + col - 1 : this.numRows * row + this.numCols - 1;
    }

    return -1;
  }

  private getIndex(row: number, col: number): number {
    return this.numRows * row + col;
  }

  private getRow(index: number): number {
    return Math.floor(index / this.numCols);
  }

  private getCol(index: number): number {
    return index % this.numCols;
  }

  private toggleSquareType(index: number): void {
    let square = this.grid[this.getRow(index)][this.getCol(index)];
    square.type = square.type == SquareType.Letter ? SquareType.Spacer : SquareType.Letter;
    square.circled = false;
    square.value = "";

    let reflectSquare = this.grid[this.numRows - this.getRow(index) - 1][this.numCols - this.getCol(index) - 1];
    reflectSquare.type = square.type;
    reflectSquare.value = "";
  }

  private setSquareValue(index: number, value: string): void {
    let square = this.grid[this.getRow(index)][this.getCol(index)];
    square.value = value.toUpperCase();
  }

  private setNumber(index: number, num: number): boolean {
    let row = this.getRow(index);
    let col = this.getCol(index);
    let square = this.grid[row][col];
    let ret = false;

    if (square.type == SquareType.Spacer) return ret;

    if (row == 0 || this.grid[row - 1][col].type == SquareType.Spacer) {
      square.clueNum = num;
      square.downClue = true;
      this.downClues.push({ index: num, clue: "Some down clue" });
      ret = true;
    }

    if (col == 0 || this.grid[row][col - 1].type == SquareType.Spacer) {
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
