import { Component, OnDestroy, OnInit } from "@angular/core";
import { Clue, PuzzleService } from "../services/puzzle.service";
import { LoadService } from "../services/load.service";
import { mergeMap, takeWhile } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
import { GridConfig } from "../components/grid/grid.component";

@Component({
  selector: "app-puzzle-review",
  templateUrl: "./puzzle-review.component.html",
  styleUrls: ["./puzzle-review.component.scss"],
})
export class PuzzleReviewComponent implements OnInit, OnDestroy {
  public puzzleLoaded: boolean = false;

  get acrossClues(): Array<Clue> {
    return this.puzzleService.puzzle.acrossClues;
  }

  get downClues(): Array<Clue> {
    return this.puzzleService.puzzle.downClues;
  }

  get title(): string {
    return this.puzzleService.puzzle.name;
  }

  public gridConfig$: BehaviorSubject<GridConfig> = new BehaviorSubject({
    readonly: true,
    answersHidden: true,
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
}
