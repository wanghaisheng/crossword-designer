import { Component, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { Clue, ClueType, PuzzleService } from "../services/puzzle.service";

@Component({
  selector: "app-clue-editing",
  templateUrl: "./clue-editing.component.html",
  styleUrls: ["./clue-editing.component.scss"],
})
export class ClueEditingComponent implements OnInit {
  public cluesForm: FormGroup = new FormGroup({
    across: new FormArray([]),
    down: new FormArray([]),
  });

  public get acrossClues(): Array<Clue> {
    return this.puzzleService.puzzle.acrossClues;
  }

  public get downClues(): Array<Clue> {
    return this.puzzleService.puzzle.downClues;
  }

  constructor(private puzzleService: PuzzleService) {}

  ngOnInit(): void {
    this.cluesForm = new FormGroup({
      across: new FormArray(this.puzzleService.puzzle.acrossClues.map((clue) => new FormControl(clue.text))),
      down: new FormArray(this.puzzleService.puzzle.downClues.map((clue) => new FormControl(clue.text))),
    });
  }

  public updateAcrossClue(index: number): void {
    const control = (this.cluesForm.get("across") as FormArray).at(index);

    if (control.dirty) {
      let clue = this.puzzleService.puzzle.acrossClues[index];
      let text = this.cluesForm.value.across[index];

      this.puzzleService.setClueText(ClueType.Across, clue.num, text);
      control.markAsPristine();
    }
  }

  public updateDownClue(index: number): void {
    const control = (this.cluesForm.get("down") as FormArray).at(index);

    if (control.dirty) {
      let clue = this.puzzleService.puzzle.downClues[index];
      let text = this.cluesForm.value.down[index];

      this.puzzleService.setClueText(ClueType.Down, clue.num, text);
      control.markAsPristine();
    }
  }

  public onSave(): void {
    this.puzzleService.savePuzzle().subscribe(
      () => {},
      (err: ErrorEvent) => {
        alert("Clues failed to save: " + err.message);
      }
    );
  }

  public onClear(): void {
    this.puzzleService.clearPuzzle();
  }
}
