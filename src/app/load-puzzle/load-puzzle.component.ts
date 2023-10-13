import { Component, OnInit } from "@angular/core";
import { PuzzleDoc } from "../services/puzzle.service";

import { FormControl, FormGroup } from "@angular/forms";
import { LoadService } from "../services/load.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-load-puzzle",
  templateUrl: "./load-puzzle.component.html",
  styleUrls: ["./load-puzzle.component.scss"],
})
export class LoadPuzzleComponent implements OnInit {
  public puzzleList: Array<PuzzleDoc> = [];
  public listLoaded: boolean = false;

  public newPuzzleForm = new FormGroup({
    title: new FormControl(""),
    width: new FormControl(""),
    height: new FormControl(""),
  });

  constructor(private router: Router, private loadService: LoadService) {}

  ngOnInit(): void {
    this.loadService.getPuzzleList().subscribe((puzzles: Array<PuzzleDoc>) => {
      this.puzzleList = puzzles;

      this.listLoaded = true;
    });
  }

  public loadPuzzle(id: string): void {
    this.loadService.loadPuzzle(id).subscribe(
      () => this.router.navigateByUrl("/answers"),
      (err: ErrorEvent) => {
        alert("Failed to load puzzle: " + err.message);
      }
    );
  }

  public createPuzzle(): void {
    this.loadService
      .createPuzzle(this.newPuzzleForm.value.title, this.newPuzzleForm.value.width, this.newPuzzleForm.value.height)
      .subscribe(
        () => this.router.navigateByUrl("/answers"),
        (err: ErrorEvent) => {
          alert("Failed to create puzzle: " + err.message);
        }
      );
  }

  public deletePuzzle(id: string): void {
    this.loadService.deletePuzzle(id).subscribe(
      () => (this.puzzleList = this.puzzleList.filter((p) => p.id != id)),
      (err: ErrorEvent) => {
        alert("Failed to delete puzzle: " + err.message);
      }
    );
  }

  public setPuzzleLock(id: string, value: boolean): void {
    this.loadService.updatePuzzle(id, { locked: value }).subscribe(
      () => {
        let puzzle = this.puzzleList.find((p) => p.id == id);
        if (puzzle) {
          puzzle.locked = value;
        }
      },
      (err: ErrorEvent) => {
        alert("Failed to update puzzle: " + err.message);
      }
    );
  }
}
