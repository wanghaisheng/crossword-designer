import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

export interface Card {
  id: string;
  title: string;
  metricType: MetricType;
  value: any;
  readonly: boolean;
  progress?: number;
  status?: MetricStatus;
}

export enum MetricType {
  Text,
  Check,
  Percent,
  Number,
}

export enum MetricStatus {
  None = "None",
  Success = "Success",
  Warning = "Warning",
  Danger = "Danger",
}

@Component({
  selector: "app-card-group",
  templateUrl: "./card-group.component.html",
  styleUrls: ["./card-group.component.scss"],
})
export class CardGroupComponent implements OnInit {
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
