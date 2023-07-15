import { Component, OnInit } from "@angular/core";
import { Clue, OverlayType, PuzzleService, Square, SquareType } from "../services/puzzle.service";

enum EditMode {
  Value,
  Spacer,
  Circle,
  Shade,
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
  public answersHidden: boolean = false;
  public selectedIndex: number = 0;

  public puzzleGrid: Array<Square> = [];

  constructor(private puzzleService: PuzzleService) {}

  ngOnInit(): void {
    this.puzzleService.activatePuzzle("test");
    this.puzzleService.$activeGrid.subscribe((grid: Array<Square>) => {
      this.puzzleGrid = grid;
    });

    this.puzzleService.messenger.subscribe((msg: string) => {
      if (msg == "clear") {
        this.onClickSquare(0);
      }
    });
  }

  public onClickSquare(index: number) {
    let square = this.puzzleGrid[index];
    this.onSelectSquare(index);

    if (this.editMode == EditMode.Spacer) {
      this.puzzleService.toggleSquareType(square.index);
    } else if (this.editMode == EditMode.Circle) {
      this.puzzleService.toggleSquareOverlay(square.index, OverlayType.Circle);
    } else if (this.editMode == EditMode.Shade) {
      this.puzzleService.toggleSquareOverlay(square.index, OverlayType.Shade);
    } else if (this.editMode == EditMode.Value) {
    }
  }

  public onKeyDown(event: KeyboardEvent) {
    let square = this.puzzleGrid[this.selectedIndex];

    if (this.isArrowKey(event.key)) {
      this.onSelectSquare(this.getNextIndex(square.index, event.key));
    } else if (event.key == "Enter") {
      this.onClickSquare(square.index);
    } else if (event.key == "Backspace") {
      this.puzzleService.setSquareValue(square.index, "");
    } else if (this.isAlphaChar(event.key)) {
      if (square.type == SquareType.Letter) this.puzzleService.setSquareValue(square.index, event.key);
    }
  }

  public getPuzzleRow(index: number): Array<Square> {
    let rowStart = index - (index % this.numCols);

    return this.puzzleGrid.slice(rowStart, rowStart + this.numCols);
  }

  public saveGrid(): void {
    this.puzzleService.savePuzzle();
  }

  public clearGrid(): void {
    this.puzzleService.clearPuzzle();
  }

  private onSelectSquare(index: number): void {
    this.selectedIndex = index;
    this.puzzleService.selectSquare(index);
  }

  private getNextIndex(index: number, key: string): number {
    // TODO: skip over spacers in Letter mode
    let rowStart = index - (index % this.numCols);
    let rowNum = this.puzzleService.getRowNum(index);
    let colNum = this.puzzleService.getColNum(index);

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

  private isAlphaChar(text: string): boolean {
    let char = text.toUpperCase();
    return char.length == 1 && char >= "A" && char <= "Z";
  }

  private isArrowKey(key: string): boolean {
    return ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(key);
  }
}
