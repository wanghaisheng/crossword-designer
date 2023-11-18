import { Component, OnInit } from "@angular/core";

import { BehaviorSubject } from "rxjs";

import { EditMode, HighlightMode, GridConfig } from "src/app/components/grid/grid.component";
import { AnswerService } from "src/app/services/answer.service";
import { PuzzleService } from "src/app/services/puzzle.service";

@Component({
  selector: "app-puzzle-editing",
  templateUrl: "./puzzle-editing.component.html",
  styleUrls: ["./puzzle-editing.component.scss"],
})
export class PuzzleEditingComponent implements OnInit {
  public puzzleLoaded: boolean = false;

  public answersHidden: boolean = false;
  public editMode: EditMode = EditMode.Value;
  public highlightMode: HighlightMode = HighlightMode.Across;

  public get locked(): boolean {
    return this.puzzleService.puzzle.locked;
  }

  public get answers(): Array<string> {
    return this.answerService.answerBank.answers;
  }

  public get themeAnswers(): Array<string> {
    return Array.from(this.answerService.answerBank.themeAnswers.keys());
  }

  public gridConfig$: BehaviorSubject<GridConfig> = new BehaviorSubject({
    readonly: false,
    answersHidden: this.answersHidden,
    editMode: this.editMode,
    highlightMode: this.highlightMode,
  } as GridConfig);

  constructor(private puzzleService: PuzzleService, private answerService: AnswerService) {}

  ngOnInit(): void {
    if (this.puzzleService.puzzle) {
      this.puzzleLoaded = true;
    }
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
