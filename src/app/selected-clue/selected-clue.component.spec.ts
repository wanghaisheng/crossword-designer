import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { SelectedClueComponent } from "./selected-clue.component";
import { BehaviorSubject } from "rxjs";
import { Clue, ClueType, PuzzleService } from "../services/puzzle.service";

describe("ClueListComponent", () => {
  let component: SelectedClueComponent;
  let fixture: ComponentFixture<SelectedClueComponent>;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["activeAcrossClue$", "activeDownClue$", "setClueText"]);

  const testAcross: Clue = {
    index: 1,
    text: "Some across clue text",
    answer: "TEST",
    squares: [0, 1, 2, 3],
  };

  const testDown: Clue = {
    index: 1,
    text: "Some down clue text",
    answer: "TESTTOO",
    squares: [0, 1, 2, 3, 4, 5, 6],
  };

  beforeEach(async () => {
    puzzleServiceSpy.activeAcrossClue$ = new BehaviorSubject(testAcross);
    puzzleServiceSpy.activeDownClue$ = new BehaviorSubject(testDown);
    puzzleServiceSpy.setClueText.and.callFake(() => {});

    await TestBed.configureTestingModule({
      declarations: [SelectedClueComponent],
      providers: [{ provide: PuzzleService, useValue: puzzleServiceSpy }],
      imports: [FormsModule, ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedClueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("saveClues", () => {
    it("should set clue text and mark across input as pristine", () => {
      component.acrossInput.setValue("Some new text");
      component.acrossInput.markAsDirty();

      component.saveClues();

      expect(puzzleServiceSpy.setClueText).toHaveBeenCalledWith(ClueType.Across, 1, "Some new text");
      expect(component.acrossInput.dirty).toEqual(false);
    });

    it("should set clue text and mark down input as pristine", () => {
      component.downInput.setValue("Some other new text");
      component.downInput.markAsDirty();

      component.saveClues();

      expect(puzzleServiceSpy.setClueText).toHaveBeenCalledWith(ClueType.Down, 1, "Some other new text");
      expect(component.downInput.dirty).toEqual(false);
    });
  });
});
