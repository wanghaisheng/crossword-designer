import { Component, OnInit } from "@angular/core";

import { BehaviorSubject } from "rxjs";

import { GridConfig } from "src/app/components/grid/grid.component";
import { PuzzleService } from "src/app/services/puzzle.service";
import { Clue } from "src/app/models/clue.model";

@Component({
  selector: "app-puzzle-review",
  templateUrl: "./puzzle-review.component.html",
  styleUrls: ["./puzzle-review.component.scss"],
})
export class PuzzleReviewComponent implements OnInit {
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

  constructor(private puzzleService: PuzzleService) {}

  ngOnInit(): void {
    if (this.puzzleService.puzzle) {
      this.puzzleLoaded = true;
    }
  }
}
