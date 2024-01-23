import { Component, HostListener, Input, OnInit } from "@angular/core";

import { BehaviorSubject } from "rxjs";

import { PuzzleService } from "src/app/services/puzzle.service";
import { OverlayType, Square, SquareType } from "src/app/models/puzzle.model";

export interface GridConfig {
  readonly: boolean;
  answersHidden: boolean;
  editMode?: EditMode;
  viewMode?: ViewMode;
}

export enum EditMode {
  Value,
  Spacer,
  Circle,
  Shade,
}

export enum ViewMode {
  Across,
  Down,
  Intersect,
}

@Component({
  selector: "app-grid",
  templateUrl: "./grid.component.html",
  styleUrls: ["./grid.component.scss"],
})
export class GridComponent implements OnInit {
  public squareHeight: number = 30;
  public selectedIndex: number = -1;

  public get numRows(): number {
    return this.puzzleService.puzzle.height;
  }

  public get numCols(): number {
    return this.puzzleService.puzzle.width;
  }

  public get puzzleGrid(): Array<Square> {
    return this.puzzleService.puzzle.grid;
  }

  public config: GridConfig = {
    readonly: false,
    answersHidden: false,
    editMode: EditMode.Value,
    viewMode: ViewMode.Intersect,
  };

  @Input() config$: BehaviorSubject<GridConfig> = new BehaviorSubject(this.config);

  constructor(private puzzleService: PuzzleService) {}

  ngOnInit(): void {
    this.config$.subscribe((config: GridConfig) => {
      this.config = config;

      if (config.readonly) {
        this.selectedIndex = -1;
      } else if (this.selectedIndex == -1) {
        this.selectedIndex = this.puzzleService.getFirstLetterIndex();
      }
    });
  }

  public onClickSquare(index: number, overrideMode?: EditMode) {
    let square = this.puzzleGrid[index];
    let editMode = overrideMode ? overrideMode : this.config.editMode;
    this.selectSquare(index);

    if (editMode == EditMode.Spacer) {
      this.puzzleService.toggleSquareType(square.index);
    } else if (editMode == EditMode.Circle) {
      this.puzzleService.toggleSquareOverlay(square.index, OverlayType.Circle);
    } else if (editMode == EditMode.Shade) {
      this.puzzleService.toggleSquareOverlay(square.index, OverlayType.Shade);
    }
  }

  @HostListener("window:keydown", ["$event"])
  public onKeyDown(event: KeyboardEvent) {
    let square = this.puzzleGrid[this.selectedIndex];

    if (this.isArrowKey(event.key)) {
      this.selectSquare(this.getNextIndex(square.index, event.key));
    } else if (event.key == "Enter") {
      if (this.config.editMode == EditMode.Value) {
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

  /**
   * Determines whether or not the provided square should be highlighted in the current highlight and edit modes
   * @param square square to highlight
   * @returns true if square should be highlighted, false otherwise
   */
  public isHighlighted(square: Square): boolean {
    if (this.selectedIndex == -1 || this.puzzleGrid[this.selectedIndex].type == SquareType.Spacer) {
      return false;
    } else if (this.config.viewMode == ViewMode.Across) {
      return square.acrossClueNum == this.puzzleGrid[this.selectedIndex].acrossClueNum;
    } else if (this.config.viewMode == ViewMode.Down) {
      return square.downClueNum == this.puzzleGrid[this.selectedIndex].downClueNum;
    } else {
      return (
        square.acrossClueNum == this.puzzleGrid[this.selectedIndex].acrossClueNum ||
        square.downClueNum == this.puzzleGrid[this.selectedIndex].downClueNum
      );
    }
  }

  private selectNextSquare(index: number): void {
    if (!this.puzzleService.isPuzzleEnd(index)) {
      if (this.config.viewMode == ViewMode.Across) {
        this.selectSquare(this.getNextIndex(index, "ArrowRight"));
      } else if (this.config.viewMode == ViewMode.Down) {
        this.selectSquare(this.getNextIndex(index, "ArrowDown"));
      }
    }
  }

  private selectPrevSquare(index: number): void {
    if (!this.puzzleService.isPuzzleStart(index)) {
      if (this.config.viewMode == ViewMode.Across) {
        this.selectSquare(this.getNextIndex(index, "ArrowLeft"));
      } else if (this.config.viewMode == ViewMode.Down) {
        this.selectSquare(this.getNextIndex(index, "ArrowUp"));
      }
    }
  }

  private selectSquare(index: number): void {
    this.selectedIndex = index;
    this.puzzleService.selectSquare(index);
  }

  private getNextIndex(index: number, key: string): number {
    let skipSpacers = this.config.editMode != EditMode.Spacer;
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
