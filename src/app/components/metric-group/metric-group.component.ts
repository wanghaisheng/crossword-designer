import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

export interface Card {
  id: string;
  title: string;
  metricType: Type;
  value: any;
  progress?: number;
  status?: Status;
}

export enum Type {
  Text,
  Check,
  Percent,
  Number,
}

export enum Status {
  None = "None",
  Success = "Success",
  Warning = "Warning",
  Danger = "Danger",
}

@Component({
  selector: "app-metric-group",
  templateUrl: "./metric-group.component.html",
  styleUrls: ["./metric-group.component.scss"],
})
export class MetricGroupComponent implements OnInit {
  @Input() cards: Array<Card> = [];
  @Output() clickEvent = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {
    this.cards.sort((a, b) => a.metricType - b.metricType);
  }

  public onClick(id: string): void {
    this.clickEvent.emit(id);
  }
}
