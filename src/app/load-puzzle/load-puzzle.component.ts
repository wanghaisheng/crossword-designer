import { Component, OnInit } from "@angular/core";
import { PuzzleService, PuzzleDoc } from "../services/puzzle.service";

import { FormControl, FormGroup } from "@angular/forms";

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

  constructor(private puzzleService: PuzzleService) {}

  ngOnInit(): void {
    this.puzzleService.getPuzzleList().subscribe((puzzles: Array<PuzzleDoc>) => {
      this.puzzleList = puzzles;
    });
  }

  public loadPuzzle(): void {
    this.puzzleService.activatePuzzle(this.loadPuzzleForm.value.id).subscribe((success: boolean) => {
      if (success) {
        alert("Puzzle loaded successfully!");
        // TODO: re-route
      } else {
        alert("Puzzle load failed");
      }
    });
  }

  public createPuzzle(): void {
    this.puzzleService
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
