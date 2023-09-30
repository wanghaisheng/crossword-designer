import { Component, OnDestroy, OnInit } from "@angular/core";
import { PuzzleService } from "../services/puzzle.service";
import { LoadService } from "../services/load.service";
import { mergeMap, takeWhile } from "rxjs/operators";
import { EditMode, HighlightMode, GridConfig } from "../components/grid/grid.component";
import { BehaviorSubject } from "rxjs";
import { AnswerBank, AnswerService } from "../services/answer.service";

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

  public get answerBank(): AnswerBank {
    return this.answerService.answerBank;
  }

  public gridConfig$: BehaviorSubject<GridConfig> = new BehaviorSubject({
    readonly: false,
    answersHidden: this.answersHidden,
    editMode: this.editMode,
    highlightMode: this.highlightMode,
  } as GridConfig);

  private active: boolean = true;

  constructor(private puzzleService: PuzzleService, private loadService: LoadService, private answerService: AnswerService) {}

  ngOnInit(): void {
    this.loadService.activePuzzleId$
      .pipe(
        takeWhile(() => this.active),
        mergeMap((id: string) => this.puzzleService.loadPuzzle(id))
      )
      .subscribe(
        (result: boolean) => {
          if (result && this.puzzleService.puzzle) {
            this.puzzleLoaded = true;
          } else {
            console.error("Something went wrong during puzzle load...");
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
    this.gridConfig$.next({
      readonly: false,
      answersHidden: this.answersHidden,
      editMode: this.editMode,
      highlightMode: this.highlightMode,
    });
  }

  public onSave(): void {
    this.puzzleService.savePuzzle().subscribe(
      () => {},
      (err: ErrorEvent) => {
        alert("Puzzle failed to save: " + err.message);
      }
    );
  }

  public onClear(): void {
    this.puzzleService.clearPuzzle();
  }
}
