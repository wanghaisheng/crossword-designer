import { Component, OnInit } from "@angular/core";
import { OverlayType, PuzzleService, Square, SquareType } from "../services/puzzle.service";

enum EditMode {
  Value,
  Spacer,
  Circle,
  Shade,
}

enum HighlightMode {
  Across,
  Down,
  Intersect,
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
  public highlightMode: HighlightMode = HighlightMode.Across;
  public answersHidden: boolean = false;
  public selectedIndex: number = 0;

  public puzzleGrid: Array<Square> = [];

  constructor(private puzzleService: PuzzleService) {}

  ngOnInit(): void {
    // this.puzzleService.activatePuzzle("test");
    this.puzzleService.createPuzzle(this.numRows);
    this.puzzleService.$activeGrid.subscribe((grid: Array<Square>) => {
      this.puzzleGrid = grid;
    });

    this.puzzleService.messenger.subscribe((msg: string) => {
      if (msg == "clear") {
        this.selectedIndex = 0;
      }
    });
  }

  public onClickSquare(index: number, overrideMode?: EditMode) {
    let square = this.puzzleGrid[index];
    let editMode = overrideMode ? overrideMode : this.editMode;
    this.onSelectSquare(index);

    if (editMode == EditMode.Spacer) {
      this.puzzleService.toggleSquareType(square.index);
    } else if (editMode == EditMode.Circle) {
      this.puzzleService.toggleSquareOverlay(square.index, OverlayType.Circle);
    } else if (editMode == EditMode.Shade) {
      this.puzzleService.toggleSquareOverlay(square.index, OverlayType.Shade);
    } else if (editMode == EditMode.Value) {
    }
  }

  public onKeyDown(event: KeyboardEvent) {
    let square = this.puzzleGrid[this.selectedIndex];

    if (this.isArrowKey(event.key)) {
      this.onSelectSquare(this.getNextIndex(square.index, event.key));
    } else if (event.key == "Enter") {
      if (this.editMode == EditMode.Value) {
        this.onClickSquare(square.index, EditMode.Spacer);
        this.selectNextSquare(square.index);
      } else {
        this.onClickSquare(square.index);
      }
    } else if (event.key == "Backspace") {
      if (square.type == SquareType.Letter) {
        this.puzzleService.setSquareValue(square.index, " ");
        this.selectPrevSquare(square.index);
      }
    } else if (this.isAlphaChar(event.key)) {
      if (square.type == SquareType.Letter) {
        this.puzzleService.setSquareValue(square.index, event.key);
        this.selectNextSquare(square.index);
      }
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

  /**
   * Determines whether or not the provided square should be highlighted in the current highlight and edit modes
   * @param square square to highlight
   * @returns true if square should be highlighted, false otherwise
   */
  public isHighlighted(square: Square): boolean {
    if (this.editMode == EditMode.Value) {
      if (this.highlightMode == HighlightMode.Across) {
        return square.acrossClueNum == this.puzzleGrid[this.selectedIndex].acrossClueNum;
      } else if (this.highlightMode == HighlightMode.Down) {
        return square.downClueNum == this.puzzleGrid[this.selectedIndex].downClueNum;
      } else {
        return (
          square.acrossClueNum == this.puzzleGrid[this.selectedIndex].acrossClueNum ||
          square.downClueNum == this.puzzleGrid[this.selectedIndex].downClueNum
        );
      }
    } else {
      return false;
    }
  }

  private selectNextSquare(index: number): void {
    if (!this.puzzleService.isPuzzleEnd(index)) {
      if (this.highlightMode == HighlightMode.Across) {
        this.onSelectSquare(this.getNextIndex(index, "ArrowRight"));
      } else if (this.highlightMode == HighlightMode.Down) {
        this.onSelectSquare(this.getNextIndex(index, "ArrowDown"));
      }
    }
  }

  private selectPrevSquare(index: number): void {
    if (!this.puzzleService.isPuzzleStart(index)) {
      if (this.highlightMode == HighlightMode.Across) {
        this.onSelectSquare(this.getNextIndex(index, "ArrowLeft"));
      } else if (this.highlightMode == HighlightMode.Down) {
        this.onSelectSquare(this.getNextIndex(index, "ArrowUp"));
      }
    }
  }

  private onSelectSquare(index: number): void {
    this.selectedIndex = index;
    this.puzzleService.selectSquare(index);
  }

  private getNextIndex(index: number, key: string): number {
    let skipSpacers = this.editMode != EditMode.Spacer;
    let vertical = key == "ArrowDown" || key == "ArrowUp";

    if (key == "ArrowDown" || key == "ArrowRight") {
      return this.puzzleService.getNextIndex(index, vertical, skipSpacers);
    } else if (key == "ArrowUp" || key == "ArrowLeft") {
      return this.puzzleService.getPrevIndex(index, vertical, skipSpacers);
    }

    return index;
  }

  private isAlphaChar(text: string): boolean {
    let char = text.toUpperCase();
    return char.length == 1 && char >= "A" && char <= "Z";
  }

  private isArrowKey(key: string): boolean {
    return ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(key);
  }
}
