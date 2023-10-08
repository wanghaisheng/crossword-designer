import { Component, OnInit } from "@angular/core";
import { PuzzleDoc, PuzzleService } from "../services/puzzle.service";

import { FormControl, FormGroup } from "@angular/forms";
import { LoadService } from "../services/load.service";
import { Router } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { AnswerService } from "../services/answer.service";
import { Card, Status, Type } from "../components/metric-group/metric-group.component";

@Component({
  selector: "app-load-puzzle",
  templateUrl: "./load-puzzle.component.html",
  styleUrls: ["./load-puzzle.component.scss"],
})
export class LoadPuzzleComponent implements OnInit {
  public puzzleList: Array<PuzzleDoc> = [];
  public puzzleCards: Array<Card> = [];
  public listLoaded: boolean = false;

  public loadPuzzleForm = new FormGroup({
    id: new FormControl(""),
  });

  public newPuzzleForm = new FormGroup({
    title: new FormControl(""),
    width: new FormControl(""),
    height: new FormControl(""),
  });

  constructor(
    private router: Router,
    private loadService: LoadService,
    private answerService: AnswerService,
    private puzzleService: PuzzleService
  ) {}

  ngOnInit(): void {
    this.loadService.getPuzzleList().subscribe((puzzles: Array<PuzzleDoc>) => {
      this.puzzleList = puzzles;
      this.buildPuzzleCards();

      this.listLoaded = true;
    });
  }

  public loadPuzzle(id: string): void {
    if (id) {
      this.answerService
        .loadAnswers(id)
        .pipe(switchMap(() => this.puzzleService.loadPuzzle(id)))
        .subscribe(
          () => {
            this.loadService.setActiveId(id);
            this.router.navigateByUrl("/answers");
          },
          (err: ErrorEvent) => {
            alert("Failed to load puzzle: " + err.message);
          }
        );
    }
  }

  public createPuzzle(): void {
    this.loadService
      .createPuzzle(this.newPuzzleForm.value.title, this.newPuzzleForm.value.width, this.newPuzzleForm.value.height)
      .subscribe(
        (result: boolean) => {
          if (!result) {
            console.error("Something went wrong during puzzle creation...");
          }
        },
        (err: ErrorEvent) => {
          alert("Failed to create puzzle: " + err.message);
        }
      );
  }

  private buildPuzzleCards(): void {
    this.puzzleCards = this.puzzleList.map((puzzle: PuzzleDoc) => {
      return {
        id: puzzle.id,
        title: puzzle.name,
        metricType: Type.Text,
        value: `${puzzle.width}x${puzzle.height}`,
        readonly: false,
        status: Status.None,
      };
    });
  }
}
