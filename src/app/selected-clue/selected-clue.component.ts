import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Clue, ClueType, PuzzleService } from "../services/puzzle.service";

@Component({
  selector: "app-selected-clue",
  templateUrl: "./selected-clue.component.html",
  styleUrls: ["./selected-clue.component.scss"],
})
export class SelectedClueComponent implements OnInit {
  public acrossInput: FormControl = new FormControl("");
  public downInput: FormControl = new FormControl("");

  public acrossClue: Clue = new Clue();
  public downClue: Clue = new Clue();

  constructor(private puzzleService: PuzzleService) {}

  ngOnInit(): void {
    this.puzzleService.activeAcrossClue$.subscribe((index: number) => {
      if (index != -1) {
        this.acrossClue = this.puzzleService.puzzle.acrossClues[index];
        this.acrossInput.setValue(this.acrossClue.text);
        this.acrossInput.enable();
      } else {
        this.acrossClue = new Clue();
        this.acrossInput.reset();
        this.acrossInput.disable();
      }
    });

    this.puzzleService.activeDownClue$.subscribe((index: number) => {
      if (index != -1) {
        this.downClue = this.puzzleService.puzzle.downClues[index];
        this.downInput.setValue(this.downClue.text);
        this.downInput.enable();
      } else {
        this.downClue = new Clue();
        this.downInput.reset();
        this.downInput.disable();
      }
    });
  }

  public saveClues(): void {
    if (this.acrossInput.dirty) {
      this.puzzleService.setClueText(ClueType.Across, this.acrossClue.num, this.acrossInput.value);
      this.acrossInput.markAsPristine();
    }

    if (this.downInput.dirty) {
      this.puzzleService.setClueText(ClueType.Down, this.downClue.num, this.downInput.value);
      this.downInput.markAsPristine();
    }
  }
}
