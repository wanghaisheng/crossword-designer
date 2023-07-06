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
  circled: boolean;
  boxNum?: number;
  downClueNum?: number;
  acrossClueNum?: number;

  constructor(index: number = -1, size: number = 21) {
    this.index = index;
    this.value = "";
    this.type = SquareType.Letter;
    this.boxNum = index < size ? index + 1 : index % size == 0 ? size + Math.floor(index / size) : undefined;
    this.downClueNum = (index % size) + 1;
    this.acrossClueNum = Math.floor(index / size) + 1;
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

  onSelectSquare(index: number) {
    let square = this.puzzle[index];
    let reflectSquare = this.puzzle[this.getReflectIndex(index)];

    if (this.editMode == EditMode.Spacer) {
      this.toggleSquareType(square.index);
      this.renumberPuzzle();
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
      this.onSelectSquare(square.index);
    } else if (event.key == "Backspace") {
      this.setSquareValue(square.index, "");
    } else if (this.isAlphaChar(event.key)) {
      if (square.type == SquareType.Letter) this.setSquareValue(square.index, event.key);
    }
  }

  hideAnswers() {
    // TODO
  }

  renumberPuzzle(): void {
    let num = 1;

    // Keep track of current across/down clue numbers
    let acrossNum = 1;
    let downNums = [...Array(this.numCols).keys()];

    // Update the box and clue numbers for each square
    for (let i = 0; i < this.numRows * this.numCols; ++i) {
      let square = this.puzzle[i];
      const across = this.needsAcrossNumber(square.index);
      const down = this.needsDownNumber(square.index);

      // Spacer
      if (square.type == SquareType.Spacer) {
        square.boxNum = undefined;
        square.acrossClueNum = undefined;
        square.downClueNum = undefined;
        continue;
      }

      // Letter
      if (across || down) {
        // Numbered Square
        if (across) acrossNum = num;
        if (down) downNums[this.getColNum(square.index)] = num;
        square.boxNum = num++;
      } else {
        // Un-numbered Square
        square.boxNum = undefined;
      }

      square.acrossClueNum = acrossNum;
      square.downClueNum = downNums[this.getColNum(square.index)];
    }

    this.$across.next(this.acrossClues);
    this.$down.next(this.downClues);
  }

  clearGrid(): void {
    for (let i = 0; i < this.numRows * this.numCols; ++i) {
      this.puzzle[i] = new Square(i, this.numCols);
    }
  }

  getPuzzleRow(index: number): Array<Square> {
    let rowStart = index - (index % this.numCols);

    return this.puzzle.slice(rowStart, rowStart + this.numCols);
  }

  getRowNum(index: number): number {
    return Math.floor(index / this.numCols);
  }

  getColNum(index: number): number {
    return index % this.numCols;
  }

  private getNextIndex(index: number, key: string): number {
    let rowStart = index - (index % this.numCols);
    let rowNum = this.getRowNum(index);
    let colNum = this.getColNum(index);

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

  private needsAcrossNumber(index: number): boolean {
    let square = this.puzzle[index];

    if (square.type == SquareType.Spacer) return false;
    else if (index % this.numCols == 0 || this.puzzle[index - 1].type == SquareType.Spacer) return true;

    return false;
  }

  private needsDownNumber(index: number): boolean {
    let square = this.puzzle[index];

    if (square.type == SquareType.Spacer) return false;
    else if (index < this.numCols || this.puzzle[index - this.numRows].type == SquareType.Spacer) return true;

    return false;
  }

  private isAlphaChar(text: string): boolean {
    let char = text.toUpperCase();
    return char.length == 1 && char >= "A" && char <= "Z";
  }

  private isArrowKey(key: string): boolean {
    return ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(key);
  }
}
