import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ClueEditingComponent } from "./clue-editing.component";

describe("ClueDraftingComponent", () => {
  let component: ClueEditingComponent;
  let fixture: ComponentFixture<ClueEditingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClueEditingComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClueEditingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
