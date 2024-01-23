import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Filter } from "src/app/components/toolbar/toolbar.component";

import { AnswerService } from "src/app/services/answer.service";
import { PuzzleService } from "src/app/services/puzzle.service";

@Component({
  selector: "app-answer-drafting",
  templateUrl: "./answer-drafting.component.html",
  styleUrls: ["./answer-drafting.component.scss"],
})
export class AnswerDraftingComponent implements OnInit {
  public get themeAnswers(): Array<[string, Array<number>]> {
    return [...this.answerService.answerBank.themeAnswers]
      .filter((t) => {
        return (
          (this.filter.length == undefined || this.filter.length == t[0].length) &&
          (this.filter.contains == undefined || t[0].includes(this.filter.contains.toUpperCase() || ""))
        );
      })
      .sort((a, b) => (this.sortReverse ? b[0].length - a[0].length : a[0].length - b[0].length));
  }

  public get answers(): Array<string> {
    return this.answerService.answerBank.answers
      .filter((a) => {
        return (
          (this.filter.length == undefined || this.filter.length == a.length) &&
          (this.filter.contains == undefined || a.includes(this.filter.contains.toUpperCase() || ""))
        );
      })
      .sort((a, b) => (this.sortReverse ? b.length - a.length : a.length - b.length));
  }

  public get name(): string {
    return this.puzzleService.puzzle.name;
  }

  public get locked(): boolean {
    return this.puzzleService.puzzle.locked;
  }

  public newThemeAnswerForm = new FormGroup({
    answer: new FormControl(""),
  });

  public newAnswerForm = new FormGroup({
    answer: new FormControl(""),
  });

  public filter: Filter = { length: null, contains: null };
  public sortReverse: boolean = false;

  constructor(private answerService: AnswerService, private puzzleService: PuzzleService) {}

  ngOnInit(): void {}

  public addAnswer(isTheme: boolean) {
    if (isTheme) {
      const answer = this.newThemeAnswerForm.value.answer?.replace(/ /g, "").toUpperCase();
      this.answerService.addAnswer(answer, true);
      this.newThemeAnswerForm.reset();
    } else {
      const answer = this.newAnswerForm.value.answer?.replace(/ /g, "").toUpperCase();
      this.answerService.addAnswer(answer, false);
      this.newAnswerForm.reset();
    }
  }

  public removeAnswer(key: string, isTheme: boolean) {
    this.answerService.removeAnswer(key, isTheme);
  }

  public onLock(): void {
    this.puzzleService.togglePuzzleLock();
  }

  public onSave(): void {
    this.answerService.saveAnswers().subscribe(
      () => {},
      (err: ErrorEvent) => {
        alert("Answers failed to save: " + err.message);
      }
    );
  }

  public onEditModeChange(): void {
    // TODO
  }

  public toggleCircle(key: string, index: number) {
    this.answerService.toggleCircle(key, index);
  }

  public onClear(): void {
    this.answerService.clearAnswers();
  }

  public onSort(): void {
    this.sortReverse = !this.sortReverse;
  }

  public onFilter($event: Filter): void {
    this.filter = $event;
  }
}
