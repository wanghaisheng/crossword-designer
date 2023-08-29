import { Component, OnInit } from "@angular/core";
import { PuzzleDoc } from "../services/puzzle.service";

import { FormControl, FormGroup } from "@angular/forms";
import { LoadService } from "../services/load.service";

@Component({
  selector: "app-load-puzzle",
  templateUrl: "./load-puzzle.component.html",
  styleUrls: ["./load-puzzle.component.scss"],
})
export class LoadPuzzleComponent implements OnInit {
  public puzzleList: Array<PuzzleDoc> = [];

  public loadPuzzleForm = new FormGroup({
    id: new FormControl(""),
  });

  public newPuzzleForm = new FormGroup({
    title: new FormControl(""),
    width: new FormControl(""),
    height: new FormControl(""),
  });

  constructor(private loadService: LoadService) {}

  ngOnInit(): void {
    this.loadService.getPuzzleList().subscribe((puzzles: Array<PuzzleDoc>) => {
      this.puzzleList = puzzles;
    });
  }

  public loadPuzzle(): void {
    if (this.loadPuzzleForm.value.id) {
      this.loadService.setActiveId(this.loadPuzzleForm.value.id);
    }
  }

  public createPuzzle(): void {
    this.loadService
      .createPuzzle(this.newPuzzleForm.value.title, this.newPuzzleForm.value.width, this.newPuzzleForm.value.height)
      .subscribe((success: boolean) => {
        if (success) {
          alert("Puzzle created successfully!");
          // TODO: re-route
        } else {
          alert("Puzzle creation failed");
        }
      });
  }
}
