import { Component, Input, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface Clue {
  index: number;
  clue: string;
}

@Component({
  selector: "app-clue-list",
  templateUrl: "./clue-list.component.html",
  styleUrls: ["./clue-list.component.scss"],
})
export class ClueListComponent implements OnInit {
  @Input() $across: BehaviorSubject<Array<Clue>> = new BehaviorSubject([{ index: 0, clue: "" }]);
  @Input() $down: BehaviorSubject<Array<Clue>> = new BehaviorSubject([{ index: 0, clue: "" }]);
  public acrossClues: Array<Clue> = [];
  public downClues: Array<Clue> = [];

  constructor() {}

  ngOnInit(): void {
    this.$across.subscribe((clues: Array<Clue>) => {
      this.acrossClues = clues;
    });

    this.$down.subscribe((clues: Array<Clue>) => {
      this.downClues = clues;
    });
  }
}
