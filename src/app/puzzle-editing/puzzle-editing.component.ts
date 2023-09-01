import { Component, OnDestroy, OnInit } from "@angular/core";
import { PuzzleService } from "../services/puzzle.service";
import { LoadService } from "../services/load.service";
import { mergeMap, takeWhile } from "rxjs/operators";
import { EditMode, HighlightMode, GridConfig } from "../components/grid/grid.component";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-puzzle-editing",
  templateUrl: "./puzzle-editing.component.html",
  styleUrls: ["./puzzle-editing.component.scss"],
})
export class PuzzleEditingComponent implements OnInit, OnDestroy {
  public puzzleLoaded: boolean = false;

  public answersHidden: boolean = false;
  public editMode: EditMode = EditMode.Value;
  public highlightMode: HighlightMode = HighlightMode.Across;

  public puzzleConfig$: BehaviorSubject<GridConfig> = new BehaviorSubject({
    readonly: false,
    answersHidden: this.answersHidden,
    editMode: this.editMode,
    highlightMode: this.highlightMode,
  } as GridConfig);

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
          this.puzzleLoaded = true;

          if (result) {
            alert("Puzzle loaded successfully!");
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

  public onUpdateConfig(): void {
    this.puzzleConfig$.next({
      readonly: false,
      answersHidden: this.answersHidden,
      editMode: this.editMode,
      highlightMode: this.highlightMode,
    });
  }

  public onSave(): void {
    this.puzzleService.savePuzzle().subscribe(() => {
      alert("Puzzle saved!");
    });
  }

  public onClear(): void {
    this.puzzleService.clearPuzzle();
  }
}
