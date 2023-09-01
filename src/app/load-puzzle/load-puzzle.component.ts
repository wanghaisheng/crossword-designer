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

  public loadPuzzleForm = new FormGroup({
    id: new FormControl(""),
  });

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
    if (id) {
      this.loadService.setActiveId(id);
      this.router.navigateByUrl("/answers");
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
