import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Card, MetricGroupComponent, Type } from "./metric-group.component";
import { DebugElement } from "@angular/core";
import { By } from "@angular/platform-browser";

describe("MetricGroupComponent", () => {
  let component: MetricGroupComponent;
  let fixture: ComponentFixture<MetricGroupComponent>;
  let cardEls: Array<DebugElement>;

  const testCards: Array<Card> = [
    {
      id: "card-1",
      title: "Card 1",
      metricType: Type.Check,
      value: true,
      readonly: true,
    },
    {
      id: "card-2",
      title: "Card 3",
      metricType: Type.Number,
      value: 0,
      readonly: true,
    },
    {
      id: "card-3",
      title: "Card 3",
      metricType: Type.Check,
      value: false,
      readonly: true,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetricGroupComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricGroupComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should sort cards by metric type", () => {
      component.cards = testCards;
      fixture.detectChanges();

      expect(component.cards[0].id).toEqual("card-1");
      expect(component.cards[1].id).toEqual("card-3");
    });
  });

  describe("onClick", () => {
    beforeEach(() => {
      spyOn(component.clickEvent, "emit");

      component.cards = testCards;
      fixture.detectChanges();
      cardEls = fixture.debugElement.queryAll(By.css(".card"));
    });

    it("should emit click event", () => {
      cardEls[1].triggerEventHandler("click", undefined);

      expect(component.clickEvent.emit).toHaveBeenCalledWith(testCards[1].id);
    });
  });
});
