import { Component, OnInit } from "@angular/core";
import { OverlayType, PuzzleService, Square, SquareType } from "../services/puzzle.service";
import { LoadService } from "../services/load.service";
import { mergeMap, takeWhile } from "rxjs/operators";

export enum EditMode {
  Value,
  Spacer,
  Circle,
  Shade,
}

export enum HighlightMode {
  Across,
  Down,
  Intersect,
}

@Component({
  selector: "app-puzzle-editing",
  templateUrl: "./puzzle-editing.component.html",
  styleUrls: ["./puzzle-editing.component.scss"],
})
export class PuzzleEditingComponent implements OnInit {
  public squareHeight: number = 30;

  public editMode: EditMode = EditMode.Value;
  public highlightMode: HighlightMode = HighlightMode.Across;
  public answersHidden: boolean = false;
  public selectedIndex: number = 0;

  public get numRows(): number {
    return this.puzzleService.puzzle.height;
  }

  public get numCols(): number {
    return this.puzzleService.puzzle.width;
  }

  public get puzzleGrid(): Array<Square> {
    return this.puzzleService.puzzle.grid;
  }

  public puzzleLoaded: boolean = false;

  private active: boolean = true;

  constructor(private puzzleService: PuzzleService, private loadService: LoadService) {}

  ngOnInit(): void {
    this.loadService.activePuzzleId$
      .pipe(
        takeWhile(() => this.active),
        mergeMap((id: string) => this.puzzleService.loadPuzzle(id))
      )
      .subscribe(
        (result: boolean) => {
          if (result) {
            alert("Puzzle loaded successfully!");
          }

          if (this.puzzleService.puzzle) {
            this.puzzleLoaded = true;
          }
        },
        (err: ErrorEvent) => {
          alert("Puzzle load failed: " + err.message);
        }
      );
  }

  ngOnDestroy(): void {
    this.active = false;
  }

  public onClickSquare(index: number, overrideMode?: EditMode) {
    let square = this.puzzleGrid[index];
    let editMode = overrideMode ? overrideMode : this.editMode;
    this.selectSquare(index);

    if (editMode == EditMode.Spacer) {
      this.puzzleService.toggleSquareType(square.index);
    } else if (editMode == EditMode.Circle) {
      this.puzzleService.toggleSquareOverlay(square.index, OverlayType.Circle);
    } else if (editMode == EditMode.Shade) {
      this.puzzleService.toggleSquareOverlay(square.index, OverlayType.Shade);
    }
  }

  public onKeyDown(event: KeyboardEvent) {
    let square = this.puzzleGrid[this.selectedIndex];

    if (this.isArrowKey(event.key)) {
      this.selectSquare(this.getNextIndex(square.index, event.key));
    } else if (event.key == "Enter") {
      if (this.editMode == EditMode.Value) {
        this.onClickSquare(square.index, EditMode.Spacer);
        this.selectNextSquare(square.index);
      } else {
        this.onClickSquare(square.index);
      }
    } else if (event.key == "Backspace" && square.type == SquareType.Letter) {
      this.puzzleService.setSquareValue(square.index, " ");
      this.selectPrevSquare(square.index);
    } else if (this.isAlphaChar(event.key) && square.type == SquareType.Letter) {
      this.puzzleService.setSquareValue(square.index, event.key);
      this.selectNextSquare(square.index);
    }
  }

  public getPuzzleRow(index: number): Array<Square> {
    let rowStart = index - (index % this.numCols);

    return this.puzzleGrid.slice(rowStart, rowStart + this.numCols);
  }

  public onSave(): void {
    this.puzzleService.savePuzzle().subscribe(() => {
      alert("Puzzle saved!");
    });
  }

  public onClear(): void {
    this.selectedIndex = 0;
    this.puzzleService.clearPuzzle();
  }

  /**
   * Determines whether or not the provided square should be highlighted in the current highlight and edit modes
   * @param square square to highlight
   * @returns true if square should be highlighted, false otherwise
   */
  public isHighlighted(square: Square): boolean {
    if (this.editMode == EditMode.Value && square.type == SquareType.Letter) {
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
        this.selectSquare(this.getNextIndex(index, "ArrowRight"));
      } else if (this.highlightMode == HighlightMode.Down) {
        this.selectSquare(this.getNextIndex(index, "ArrowDown"));
      }
    }
  }

  private selectPrevSquare(index: number): void {
    if (!this.puzzleService.isPuzzleStart(index)) {
      if (this.highlightMode == HighlightMode.Across) {
        this.selectSquare(this.getNextIndex(index, "ArrowLeft"));
      } else if (this.highlightMode == HighlightMode.Down) {
        this.selectSquare(this.getNextIndex(index, "ArrowUp"));
      }
    }
  }

  private selectSquare(index: number): void {
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
