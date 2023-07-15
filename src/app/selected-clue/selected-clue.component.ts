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
    this.puzzleService.$activeAcrossClue.subscribe((clue: Clue) => {
      if (this.acrossInput.dirty) {
        this.puzzleService.setClueText(ClueType.Across, this.acrossClue.index, this.acrossInput.value);
        this.acrossInput.markAsPristine();
      }

      this.acrossClue = clue;
      this.acrossInput.setValue(clue.text);
    });

    this.puzzleService.$activeDownClue.subscribe((clue: Clue) => {
      if (this.downInput.dirty) {
        this.puzzleService.setClueText(ClueType.Down, this.downClue.index, this.downInput.value);
        this.downInput.markAsPristine();
      }

      this.downClue = clue;
      this.downInput.setValue(clue.text);
    });

    this.puzzleService.messenger.subscribe((msg: string) => {
      if (msg == "save") {
        this.puzzleService.setClueText(ClueType.Across, this.acrossClue.index, this.acrossInput.value);
        this.puzzleService.setClueText(ClueType.Down, this.downClue.index, this.downInput.value);
      }
    });
  }
}
