import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { AnswerService } from "../services/answer.service";
import { LoadService } from "../services/load.service";
import { mergeMap, takeWhile } from "rxjs/operators";

@Component({
  selector: "app-answer-drafting",
  templateUrl: "./answer-drafting.component.html",
  styleUrls: ["./answer-drafting.component.scss"],
})
export class AnswerDraftingComponent implements OnInit, OnDestroy {
  public get themeAnswers(): Map<string, Array<number>> {
    return this.answerService.answerBank.themeAnswers;
  }

  public get answers(): Array<string> {
    return this.answerService.answerBank.answers;
  }

  public newThemeAnswerForm = new FormGroup({
    answer: new FormControl(""),
  });

  public newAnswerForm = new FormGroup({
    answer: new FormControl(""),
  });

  private active: boolean = true;

  constructor(private answerService: AnswerService, private loadService: LoadService) {}

  ngOnInit(): void {
    this.loadService.activePuzzleId$
      .pipe(
        takeWhile(() => this.active),
        mergeMap((id: string) => this.answerService.loadAnswers(id))
      )
      .subscribe(
        (result: boolean) => {
          if (!result) {
            console.error("Something went wrong loading answers...");
          }
        },
        (err: ErrorEvent) => {
          alert("Answers load failed: " + err.message);
        }
      );
  }

  ngOnDestroy(): void {
    this.active = false;
  }

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

  public toggleCircle(key: string, index: number) {
    this.answerService.toggleCircle(key, index);
  }

  public onClear(): void {
    this.answerService.clearAnswers();
  }

  public onSave(): void {
    this.answerService.saveAnswers().subscribe(
      () => {},
      (err: ErrorEvent) => {
        alert("Answers failed to save: " + err.message);
      }
    );
  }
}
